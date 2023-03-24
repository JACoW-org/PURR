def get_purr_settings(event):
    from indico_purr.plugin import PurrPlugin
    return PurrPlugin.event_settings.get_all(event)


def set_purr_settings(event, **settings):
    from indico_purr.plugin import PurrPlugin
    PurrPlugin.event_settings.set_multi(event, settings)


def clear_purr_settings(event):
    from indico_purr.plugin import PurrPlugin
    PurrPlugin.event_settings.delete_all(event)
