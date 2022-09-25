import json

from datetime import date, datetime
from typing import Any
import orjson

from pytz import timezone

from indico.core.config import config

DEFAULT_TIMEZONE = timezone(config.DEFAULT_TIMEZONE)

def json_decode(data: str) -> Any:   
    return orjson.loads(data)

def json_encode(data: Any) -> str:
    def __date(obj: Any) -> str:
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        raise TypeError ("Type %s not serializable" % type(obj))
    
    return orjson.dumps(data)

