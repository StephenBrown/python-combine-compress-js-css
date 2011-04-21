#!/usr/bin/env python

import os
import os.path
from optparse import OptionParser
from configobj import ConfigObj

#path to compressor
YUI_COMPRESSOR = os.path.relpath('./yuicompressor-2.4.2.jar')

# path to base directory of resources
resources = os.path.relpath('./resources')

def combine(in_files, out_file):
    open_out_file = open(out_file, 'w')
    for in_file in in_files:
        open_in_file = open(in_file)
        data = open_in_file.read()
        open_in_file.close()
        open_out_file.write(data)
        print ' + %s' % in_file
    print 'Combined: %s' % out_file
    open_out_file.close()

def compress(in_file, out_file, compressor=YUI_COMPRESSOR, temp_file='debug_compress.temp', in_type='js', verbose=False):
    open_temp = open(temp_file, 'w')
    open_in_file = open(in_file, 'r')
    data = open_in_file.read()
    open_in_file.close()
    open_temp.write(data)
    open_temp.close()

    options = ['-o "%s"' % out_file,
               '--type %s' % in_type]
    if verbose:
        options.append('-v')

    if compressor == YUI_COMPRESSOR:
        os.system('java -jar "%s" %s "%s"' % (YUI_COMPRESSOR,
                                          ' '.join(options),
                                          temp_file))

    original_size = os.path.getsize(temp_file)
    new_size = os.path.getsize(out_file)

    print ' + %s' % in_file
    print 'Combined and compressed: %s' % out_file
    print 'Original: %.2f kB' % (original_size / 1024.0)
    print 'Compressed: %.2f kB' % (new_size / 1024.0)
    print 'Reduction: %.1f%%' % (float(original_size - new_size) / original_size * 100)

def run_scripts(do_compress=True, verbose=False):
    for file_set in config['scripts']:
        print 'Combining JavaScript...'
        combine(file_set['files-to-combine'],
                file_set['out-file-combined-path'])
        if do_compress:
            print 'Compressing JavaScript...'
            compress(file_set['out-file-combined-path'],
                     file_set['out-file-combined-compressed-path'],
                     verbose=verbose)

def run_styles(config, do_compress=True, verbose=False):
    for file_set in config['stylesheets']:
        print 'Combining CSS...'
        combine(file_set['files-to-combine'],
                file_set['out-file-combined_path'])
        if do_compress:
            print 'Compressing CSS...'
            compress(file_set['out-file-combined_path'],
                     file_set['out-file-combined-compressed-path'],
                     in_type='css', verbose=verbose)

def parse_config(filename):
    config = ConfigObj(filename)
    config.walk(lower_config_keys, call_on_sections=True)
    config.walk(make_paths)
    return config

def lower_config_keys(section, key):
    new_key = key.lower()
    section.rename(key, new_key)

def make_paths(section, key):
    val = section[key]
    section[key] = os.path.join(*val)

def run(args, options):
    config_options = parse_config(args[0])
    if (options.scripts and options.minify) or \
       (not options.scripts and not options.stylesheets and options.minify):
        run_scripts(config_options, verbose=options.verbose)
    elif (not options.scripts and not options.stylesheets) or \
         (options.scripts and not options.stylesheets and options.combine):
        run_scripts(config_options, False)
    if (options.stylesheets and options.minify) or \
       (not options.scripts and not options.stylesheets and options.minify):
        run_styles(config_options, verbose=options.verbose)
    elif (not options.scripts and not options.stylesheets) or \
         (not options.scripts and options.stylesheets and options.combine):
        run_styles(config_options, False)

def main():
    usage = 'usage: %prog [options] config_file'
    parser = OptionParser(usage=usage)
    parser.add_option('-v', '--verbose', action='store_true', dest='verbose',
            default=False, help='Add verbosity to compressor')
    parser.add_option('-m', '--minify', action='store_true', dest='minify',
            default=False, help='Combine then minify files')
    parser.add_option('-c', '--combine', action='store_true', dest='combine',
            default=False, help='Only combine files')
    parser.add_option('-s', '--stylesheets', action='store_true', dest='stylesheets',
            default=False, help='Do action to stylesheets')
    parser.add_option('-j', '--scripts', action='store_true', dest='scripts',
            default=False, help='Do action to scripts')

    (options, args) = parser.parse_args()
    if len(args) != 1:
        parser.error('config_file is missing')

    run(args, options)

if __name__ == '__main__':
    main()
