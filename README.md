## Internationalization

### Server-side

Internationalization of Indico plugins is fully supported and, like Indico, relies on [Babel](http://babel.pocoo.org).

Onced you've finished developing your plugin, in order to extract plugin strings to be translated:

```console
$ pybabel extract -o indico_example/translations/messages.pot indico_example -F babel.cfg
$ pybabel extract -o indico_example/translations/messages-js.pot indico_example --no-default-keywords -k 'gettext' -k 'ngettext:1,2' -k '$T' -F babel-js.cfg
```

Then in order to add a new language (in this case, `de_DE`):

```console
$ pybabel init -l de_DE -i indico_example/translations/messages.pot -d indico_example/translations/
```

Every time there are changes to the `*.pot` file (extracted strings), you will want to update its localized counterparts:

```console
$ pybabel update -i indico_example/translations/messages.pot -l de_DE -d indico_example/translations
```

Before packaging/running the plugin, you'll have to compile the `*.po` files.

```console
$ pybabel compile -d indico_example/translations/
```
### JavaScript (client)

```console
$ pybabel init -i indico_example/translations/messages-js.pot -l de_DE -d indico_example/translations -D messages-js
$ pybabel update -i indico_example/translations/messages-js.pot -l de_DE -d indico_example/translations -D messages-js
```

No compilation of `*.po` files is needed when it comes to JavaScript.
