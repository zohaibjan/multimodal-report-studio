import tempfile
import unittest
from pathlib import Path
from api.openai_service import OpenAIService
class StorageTests(unittest.TestCase):
    def test_parent_traversal_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            service=OpenAIService.__new__(OpenAIService)
            service.storage_dir=Path(directory)
            with self.assertRaises(ValueError):service.get_file_from_stage('../outside.txt')
    def test_read_local_file(self):
        with tempfile.TemporaryDirectory() as directory:
            service=OpenAIService.__new__(OpenAIService)
            service.storage_dir=Path(directory)
            (Path(directory)/'demo.txt').write_bytes(b'synthetic')
            self.assertEqual(service.get_file_from_stage('demo.txt'),b'synthetic')
if __name__=='__main__':unittest.main()
