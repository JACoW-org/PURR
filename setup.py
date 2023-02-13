# This file is part of the Indico plugins.
# Copyright (C) 2002 - 2022 CERN
#
# The Indico plugins are free software; you can redistribute
# them and/or modify them under the terms of the MIT License;
# see the LICENSE file for more details.

from setuptools import setup

from setuptools import setup, find_packages

setup(
    name='indico_purr',
    description='Proceedings Utility Running Remotely ',
    version='1.0-dev',
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=[
        'indico>=3.2',
        'orjson>=3.8.0'
    ],
    entry_points={
        'indico.plugins': {
            'purr = indico_purr:plugin'
        }
    }
)
