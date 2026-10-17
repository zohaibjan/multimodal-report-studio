"""
SQLite Service for local development
SQLite service for local audit records and defect tracking
"""
import os
import sqlite3
import json
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

DB_PATH = os.getenv("SQLITE_DB_PATH", str(Path(__file__).parent.parent / "local_data" / "inspections.db"))


def _ensure_db_dir():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    """Return a connection with row_factory set to sqlite3.Row."""
    _ensure_db_dir()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS inspection_audit (
        inspection_id     TEXT PRIMARY KEY,
        inspection_date   TEXT NOT NULL,
        site_address      TEXT,
        inspector_name    TEXT,
        contractor_name   TEXT,
        other_contractors TEXT,
        is_compliant      INTEGER DEFAULT 0,
        transcript_text   TEXT,
        transcript_length INTEGER DEFAULT 0,
        audio_duration_seconds REAL,
        ai_summary        TEXT,
        total_defects_found INTEGER DEFAULT 0,
        defect_codes_identified TEXT,   -- JSON array as string
        processing_status TEXT DEFAULT 'COMPLETED'
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS inspection_defects (
        defect_id          TEXT PRIMARY KEY,
        inspection_id      TEXT NOT NULL,
        defect_code        TEXT,
        defect_category    TEXT,
        defect_subcategory TEXT,
        code_description   TEXT,
        defect_found       TEXT,
        non_compliance     TEXT,
        standard_reference TEXT,
        evidence_quote     TEXT,
        FOREIGN KEY (inspection_id) REFERENCES inspection_audit(inspection_id)
    )
    """)

    conn.commit()
    conn.close()
    logger.info(f"SQLite database initialized at {DB_PATH}")


def insert_audit_record(inspection_data: dict, structured_summary: dict, audio_duration: float = None) -> str | None:
    """Insert an inspection audit row + per-defect rows.  Returns the inspection_id."""
    import uuid

    try:
        inspection_id = f"INS_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
        defects_list = structured_summary.get("defects", []) or structured_summary.get("audit_items", [])
        defect_codes = [d.get("defect_code", "UNKNOWN") for d in defects_list if d.get("defect_code")]
        transcript_text = inspection_data.get("notes", "")

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
        INSERT INTO inspection_audit (
            inspection_id, inspection_date, site_address, inspector_name,
            contractor_name, other_contractors, is_compliant, transcript_text,
            transcript_length, audio_duration_seconds, ai_summary,
            total_defects_found, defect_codes_identified, processing_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            inspection_id,
            datetime.now().isoformat(),
            inspection_data.get("site_address", ""),
            inspection_data.get("inspector_name", ""),
            inspection_data.get("contractor_name", ""),
            inspection_data.get("other_contractors", ""),
            1 if inspection_data.get("is_compliant") else 0,
            transcript_text,
            len(transcript_text),
            audio_duration,
            json.dumps(structured_summary) if isinstance(structured_summary, dict) else str(structured_summary),
            len(defects_list),
            json.dumps(defect_codes),
            "COMPLETED",
        ))

        for idx, defect in enumerate(defects_list):
            defect_id = f"{inspection_id}_D{idx + 1:03d}"
            cur.execute("""
            INSERT INTO inspection_defects (
                defect_id, inspection_id, defect_code, defect_category,
                defect_subcategory, code_description, defect_found,
                non_compliance, standard_reference, evidence_quote
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                defect_id,
                inspection_id,
                defect.get("defect_code", "UNKNOWN"),
                defect.get("category", ""),
                defect.get("subcategory", ""),
                defect.get("code_description", ""),
                defect.get("defect_found", ""),
                defect.get("non_compliance", ""),
                defect.get("standard", ""),
                defect.get("evidence_quote", ""),
            ))

        conn.commit()
        conn.close()
        logger.info(f"SQLite audit record created: {inspection_id} with {len(defects_list)} defects")
        return inspection_id

    except Exception as e:
        logger.error(f"SQLite audit insert failed: {e}")
        return None


# ---------------------------------------------------------------------------
# Dashboard queries (mirror the dashboard SQL but via SQLite)
# ---------------------------------------------------------------------------

def get_dashboard_data(from_date=None, to_date=None, compliance=None, contractor=None):
    conn = get_connection()
    cur = conn.cursor()

    clauses = ["1=1"]
    params = []
    if from_date:
        clauses.append("inspection_date >= ?")
        params.append(from_date)
    if to_date:
        clauses.append("inspection_date < date(?, '+1 day')")
        params.append(to_date)
    if compliance == "compliant":
        clauses.append("is_compliant = 1")
    elif compliance == "non-compliant":
        clauses.append("is_compliant = 0")
    if contractor and contractor != "all":
        clauses.append("contractor_name = ?")
        params.append(contractor)

    where = " AND ".join(clauses)

    # Metrics
    cur.execute(f"""
        SELECT COUNT(*) AS total, 
               SUM(CASE WHEN is_compliant=0 THEN 1 ELSE 0 END) AS non_compliant,
               SUM(CASE WHEN is_compliant=1 THEN 1 ELSE 0 END) AS compliant,
               COALESCE(SUM(total_defects_found),0) AS total_defects,
               ROUND(AVG(total_defects_found),2) AS avg_defects
        FROM inspection_audit WHERE {where}
    """, params)
    row = cur.fetchone()
    metrics = {
        "total_inspections": row["total"] or 0,
        "non_compliant": row["non_compliant"] or 0,
        "compliant": row["compliant"] or 0,
        "total_defects": row["total_defects"] or 0,
        "avg_defects": row["avg_defects"] or 0,
    }

    # Timeline
    cur.execute(f"""
        SELECT date(inspection_date) AS date, COUNT(*) AS inspections,
               SUM(CASE WHEN is_compliant=0 THEN 1 ELSE 0 END) AS non_compliant
        FROM inspection_audit WHERE {where}
        GROUP BY date(inspection_date) ORDER BY date DESC LIMIT 30
    """, params)
    timeline = [{"date": r["date"], "inspections": r["inspections"], "non_compliant": r["non_compliant"]} for r in cur.fetchall()]

    # Top defects
    cur.execute(f"""
        SELECT d.defect_code AS code, d.defect_category AS category, COUNT(*) AS count
        FROM inspection_defects d
        JOIN inspection_audit a ON d.inspection_id = a.inspection_id
        WHERE {where}
        GROUP BY d.defect_code, d.defect_category ORDER BY count DESC LIMIT 10
    """, params)
    top_defects = [{"code": r["code"], "category": r["category"], "count": r["count"]} for r in cur.fetchall()]

    # Categories
    cur.execute(f"""
        SELECT d.defect_category AS category, COUNT(*) AS count,
               COUNT(DISTINCT d.inspection_id) AS inspections
        FROM inspection_defects d
        JOIN inspection_audit a ON d.inspection_id = a.inspection_id
        WHERE {where}
        GROUP BY d.defect_category ORDER BY count DESC
    """, params)
    categories = [{"category": r["category"], "count": r["count"], "inspections": r["inspections"]} for r in cur.fetchall()]

    # Recent inspections
    cur.execute(f"""
        SELECT inspection_id, inspection_date, site_address, inspector_name,
               contractor_name, is_compliant, total_defects_found, transcript_text
        FROM inspection_audit WHERE {where}
        ORDER BY inspection_date DESC LIMIT 50
    """, params)
    inspections = [{
        "INSPECTION_ID": r["inspection_id"],
        "INSPECTION_DATE": r["inspection_date"],
        "SITE_ADDRESS": r["site_address"],
        "INSPECTOR_NAME": r["inspector_name"],
        "CONTRACTOR_NAME": r["contractor_name"],
        "IS_COMPLIANT": bool(r["is_compliant"]),
        "TOTAL_DEFECTS_FOUND": r["total_defects_found"] or 0,
        "TRANSCRIPT_TEXT": r["transcript_text"],
    } for r in cur.fetchall()]

    # Contractors list
    cur.execute("SELECT DISTINCT contractor_name FROM inspection_audit WHERE contractor_name IS NOT NULL ORDER BY contractor_name")
    contractors = [r["contractor_name"] for r in cur.fetchall()]

    conn.close()
    return {
        "metrics": metrics,
        "timeline": timeline,
        "top_defects": top_defects,
        "categories": categories,
        "inspections": inspections,
        "contractors": contractors,
    }


def get_inspection_defects(inspection_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT defect_code, defect_category, defect_subcategory,
               defect_found, non_compliance, standard_reference, evidence_quote
        FROM inspection_defects WHERE inspection_id = ?
        ORDER BY defect_code
    """, (inspection_id,))
    defects = [{
        "DEFECT_CODE": r["defect_code"],
        "DEFECT_CATEGORY": r["defect_category"],
        "DEFECT_SUBCATEGORY": r["defect_subcategory"],
        "DEFECT_FOUND": r["defect_found"],
        "NON_COMPLIANCE": r["non_compliance"],
        "STANDARD_REFERENCE": r["standard_reference"],
        "EVIDENCE_QUOTE": r["evidence_quote"],
    } for r in cur.fetchall()]
    conn.close()
    return defects
