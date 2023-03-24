from pytz import timezone

from indico.core.config import config


def export_serialize_date(date):
    if date:
        date = date.astimezone(timezone(config.DEFAULT_TIMEZONE))
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
