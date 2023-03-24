def get_purr_settings(event) -> dict:
    from indico_purr.plugin import PurrPlugin
    return PurrPlugin.event_settings.get_all(event)


def set_purr_settings(event, **settings):
    from indico_purr.plugin import PurrPlugin
    PurrPlugin.event_settings.set_multi(event, settings)


def clear_purr_settings(event):
    from indico_purr.plugin import PurrPlugin
    # XXX: if you ever add settings not related to being connected to the event,
    # you may want to just clear api url, key and connected flag instead of
    # deleting all the settings
    PurrPlugin.event_settings.delete_all(event)
