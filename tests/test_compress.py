import unittest
from nose.tools import *
import os.path
import compression

CONFIG = os.path.join('tests', 'resources', 'test.config')

class TestCombine(unittest.TestCase):

    def setUp(self):
        self.out_file = os.path.relpath('out.temp')

    def tearDown(self):
        try:
            os.remove(self.out_file)
        except OSError:
            pass

    def test_one_file(self):
        in_files =  [os.path.join('tests', 'resources', 'css', 'one-line.css')]
        compression.combine(in_files, self.out_file)
        text = open(self.out_file).read()
        self.assertEquals(text, 'body {background-color : red;}\n')

    def test_two_files(self):
        in_files =  [
            os.path.join('tests', 'resources', 'css', 'one-line.css'),
            os.path.join('tests', 'resources', 'css', 'two-line.css')
        ]
        expected = '''body {background-color : red;}
h1 {width : 100px;}
h2 {height : 50px;}
'''
        compression.combine(in_files, self.out_file)
        text = open(self.out_file).read()
        self.assertEquals(text, expected)

class TestCompress:

    def setUp(self):
        self.out_file = os.path.relpath('out.temp')

    def tearDown(self):
        try:
            os.remove(self.out_file)
        except OSError:
            pass

    def test_js(self):
        in_file = os.path.join('tests', 'resources', 'js', 'one-line.js')
        compression.compress(in_file, self.out_file)
        expected = 'var test;'
        result = open(self.out_file).read()
        self.assertEquals(result, expected)

    def test_css(self):
        in_file = os.path.join('tests', 'resources', 'css', 'one-line.css')
        compression.compress(in_file, self.out_file, in_type='css')
        expected = 'body{background-color:red;}'
        result = open(self.out_file).read()
        self.assertEquals(result, expected)

class TestConfig(unittest.TestCase):

    def __init__(self):
        self.config = compression.parse_config(CONFIG)

    def test_right_number_sections(self):
        result = self.config
        self.assertEquals(len(result.keys()), 2)

    def test_keys_lowered(self):
        result = self.config
        self.assertTrue('scripts' in result.keys())
        self.assertTrue('stylesheets' in result.keys())

    def test_parse_config(self):
        result = self.config
        self.assertEquals(len(result['scripts']), 2)
        self.assertEquals(len(result['stylesheets']), 1)

    def test_paths_made(self):
        result = self.config
        self.assertEquals(os.path.join('resources', 'js', 'combined-1.js'),
            result['scripts']['file 1']['out-file-combined-path'])

if __main__=="__main__":
    unittest.main()