import tempfile
import unittest
from pathlib import Path
from android_portraits import portrait_references


class PortraitSelectionTest(unittest.TestCase):
    def test_all_existing_old_portraits_are_retained(self):
        source = Path(__file__).resolve().parents[1] / 'game/resources/app'
        references = portrait_references(source)
        for name in ('rudeus', 'roxy', 'sylphie', 'eris', 'orsted', 'ruijerd', 'paul', 'ghislaine'):
            self.assertIn(f'image/character/mt_{name}.jpg', references)

    def test_computed_paths_are_included_and_missing_files_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory)
            (source / 'package.json').write_text('{"type":"module"}')
            registry = source / 'noname/init'; registry.mkdir(parents=True)
            (registry / 'mushoku-characters.js').write_text(
                "const id='old';export default {[id]:{img:`image/character/${id}.jpg`}};")
            image = source / 'image/character/old.jpg'; image.parent.mkdir(parents=True)
            image.write_bytes(b'fixture')
            self.assertIn('image/character/old.jpg', portrait_references(source))
            image.unlink()
            with self.assertRaises(FileNotFoundError):
                portrait_references(source)


if __name__ == '__main__':
    unittest.main()
