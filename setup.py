from setuptools import setup, find_packages


setup(
    name='indico_jpsp_ab',
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
            'jpsp_ab = indico_jpsp_ab:plugin'
        }
    }
)
