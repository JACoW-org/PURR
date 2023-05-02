from flask import jsonify, request, session
from flask_pluginengine import current_plugin

from werkzeug.exceptions import BadRequest

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.utils import get_purr_settings, set_purr_settings
from indico_purr.models.settings import PurrSettings

from indico.modules.logs import EventLogRealm, LogKind


class RHPurrSettingsDataJson(RHManageEventBase):
    CSRF_ENABLED = False

    def _process(self):
        settings = get_purr_settings(self.event)

        current_plugin.logger.info(settings)
        current_plugin.logger.info(request.method)

        contribution_fields = [{
            "id": f.id,
            "title": f.title,
        } for f in self.event.contribution_fields]

        if request.method == "POST":
            current_plugin.logger.info(request.json)

            purr_settings = PurrSettings(**request.json.get("settings"))

            errors = purr_settings.validate()
            if errors:
                return jsonify({
                    "method": request.method,
                    "is_valid": False,
                    "errors": errors
                })

            set_purr_settings(self.event, **purr_settings.as_dict())

            self.event.log(
                EventLogRealm.management,
                LogKind.change,
                "PURR",
                "Updated",
                session.user,
            )

            return jsonify(
                {
                    "method": request.method,
                    "settings": dict(**get_purr_settings(self.event),
                                     contribution_fields=contribution_fields),
                    "is_valid": True
                }
            )

        # pre-validate current settings
        purr_settings = PurrSettings(
            ab_session_h1=settings.get("ab_session_h1"),
            ab_session_h2=settings.get("ab_session_h2"),
            ab_contribution_h1=settings.get("ab_contribution_h1"),
            ab_contribution_h2=settings.get("ab_contribution_h2"),
            custom_fields=settings.get("custom_fields"),
            pdf_page_height=settings.get("pdf_page_height"),
            pdf_page_width=settings.get("pdf_page_width"),
            date=settings.get("date"),
            isbn=settings.get("isbn"),
            issn=settings.get("date"),
            booktitle_short=settings.get("booktitle_short"),
            booktitle_long=settings.get("booktitle_long"),
            series=settings.get("series"),
            series_number=settings.get("series_number"),
            location=settings.get("location"),
            host_info=settings.get("host_info"),
            editorial_board=settings.get("editorial_board"),
            doi_base_url=settings.get("doi_base_url"),
            doi_user=settings.get("doi_user"),
            doi_password=settings.get("doi_password"),
            primary_color=settings.get("primary_color"),
            site_base_url=settings.get("site_base_url")
        )

        errors = purr_settings.validate()

        return jsonify({
            "method": request.method,
            "is_valid": False if errors else True,
            "settings": dict(**settings, contribution_fields=contribution_fields)
        })
