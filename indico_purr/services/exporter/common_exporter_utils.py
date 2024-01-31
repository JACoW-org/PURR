# from pytz import timezone
# from indico.core.config import config


def export_serialize_date(date, tz):
    if date:
        # tz_val = tz if tz else config.DEFAULT_TIMEZONE
        # tz_val = config.DEFAULT_TIMEZONE
        # date = date.astimezone(timezone(tz_val))
        return {
            'date': str(date.date()),
            'time': str(date.time()),
            'tz': str(date.tzinfo)
        }


def export_serialize_reference(reference):
    return {
        'type': reference.reference_type.name,
        'value': reference.value,
        'url': reference.url,
        'urn': reference.urn
    }
