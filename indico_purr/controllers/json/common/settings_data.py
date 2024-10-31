"""
This module provides the handler for fetching and saving PURR settings
"""
from operator import ge
from webbrowser import get
from flask import jsonify, request, session

from indico.modules.events.management.controllers.base import RHManageEventBase
from indico.modules.logs import EventLogRealm, LogKind

from indico_purr.utils import get_purr_settings, set_purr_settings
from indico_purr.models.settings import PurrSettings


class RHPurrSettingsDataJson(RHManageEventBase):
    """Handler to fetch and save settings"""

    def _process(self):
        settings: dict = get_purr_settings(self.event)

        contribution_fields = [{
            "id": f.id,
            "title": f.title,
        } for f in self.event.contribution_fields]  # type: ignore

        if request.method == 'POST' and request.json is not None:
            # current_plugin.logger.info(request.json)

            purr_settings = PurrSettings(**request.json.get('settings'))

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
            ab_session_h1=settings.get('ab_session_h1', ''),
            ab_session_h2=settings.get('ab_session_h2', ''),
            ab_contribution_h1=settings.get('ab_contribution_h1', ''),
            ab_contribution_h2=settings.get('ab_contribution_h2', ''),
            custom_fields=settings.get('custom_fields', []),
            pdf_page_height=settings.get('pdf_page_height', ''),
            pdf_page_width=settings.get('pdf_page_width', ''),
            date=settings.get('date', ''),
            isbn=settings.get('isbn', ''),
            issn=settings.get('issn', ''),
            booktitle_short=settings.get('booktitle_short', ''),
            booktitle_long=settings.get('booktitle_long', ''),
            series=settings.get('series', ''),
            series_number=settings.get('series_number', ''),
            pre_print=settings.get('pre_print', ''),
            copyright_year=settings.get('copyright_year', ''),
            site_license_text=settings.get('site_license_text', ''),
            site_license_url=settings.get('site_license_url', ''),
            paper_license_icon_url=settings.get('paper_license_icon_url', ''),
            paper_license_text=settings.get('paper_license_text', ''),
            location=settings.get('location', ''),
            host_info=settings.get('host_info', ''),
            editorial_board=settings.get('editorial_board', ''),
            editorial_json=settings.get('editorial_json', ''),
            doi_env=settings.get('doi_env', ''),
            doi_proto=settings.get('doi_proto', ''),
            doi_domain=settings.get('doi_domain', ''),
            doi_context=settings.get('doi_context', ''),
            doi_organization=settings.get('doi_organization', ''),
            doi_conference=settings.get('doi_conference', ''),
            doi_user=settings.get('doi_user', ''),
            doi_password=settings.get('doi_password', ''),
            primary_color=settings.get('primary_color', ''),
            toc_grouping=settings.get('toc_grouping', []),
            materials=settings.get('materials', []),
            duplicate_of_alias=settings.get('duplicate_of_alias', ''),
            cat_publish_alias=settings.get('cat_publish_alias', '')
        )

        errors = purr_settings.validate()

        return jsonify({
            "method": request.method,
            "is_valid": not errors,
            "settings": dict(**settings, contribution_fields=contribution_fields)
        })
