
def build_folders_api_data__wrapper(contrib):
    try:
        from indico.modules.attachments.api.util import build_folders_api_data
        return build_folders_api_data(contrib)
    except BaseException as e:
        print(e)
    return None


def build_material_legacy_api_data__wrapper(contrib):
    try:
        from indico.modules.attachments.api.util import build_material_legacy_api_data
        return build_material_legacy_api_data(contrib)
    except BaseException as e:
        print(e)
    return None


def build_note_legacy_api_data__wrapper(note):
    try:
        from indico.modules.events.notes.util import build_note_legacy_api_data
        return build_note_legacy_api_data(note)
    except BaseException as e:
        print(e)
    return None


def build_note_api_data__wrapper(note):
    try:
        from indico.modules.events.notes.util import build_note_api_data
        return build_note_api_data(note)
    except BaseException as e:
        print(e)
    return None
