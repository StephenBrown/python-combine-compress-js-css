Install
-------

The single dependency in configobj so...

    pip install configobj

or

    easy_install configobj

Setup Config File
-----------------

You can choose which files and what order files are combined.

There are two sections `[ Scripts ]` and `[ Stylesheets ]`.

Within each section there are one or more outfiles `[[ File 1 ]]`.

The `out-file-combined-path` and `out-file-minified-path` are where the files will be placed and the path is seperated with commas.

The `[[[ Files ]]]` holds the path of each file that will be combined and the path is seperated with commas.
