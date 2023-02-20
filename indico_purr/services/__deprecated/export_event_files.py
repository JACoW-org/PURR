from indico_purr.services.export.export_file import ABCExportFile

from sqlalchemy.orm import joinedload

from indico.modules.events.contributions.models.contributions import Contribution
from indico.modules.events.editing.models.editable import Editable

from indico_purr.services.exporter.common_exporter_utils import export_serialize_date, export_serialize_reference


class ABCExportEventFiles(ABCExportFile):
    """ """

    def _build_event_files_api_data(self, event):

        contributions = (Contribution.query
                         .with_parent(event)
                         .options(joinedload('editables'))
                         .order_by(Contribution.friendly_id)
                         .all())

        elements = [self._serialize_contribution(
            event, contribution) for contribution in contributions]

        data: dict = self._build_event_api_data_base(event)

        data['contributions'] = [
            el for el in elements 
            if el.get('revisions', None) is not None
        ]

        return data

    def _build_event_api_data_base(self, event):
        return {
            # '_type': 'Conference',
            'id': str(event.id),
            'title': event.title,
            'description': event.description,
            'start_dt': export_serialize_date(event.start_dt),
            'timezone': event.timezone,
            'end_dt': export_serialize_date(event.end_dt),
            'room': event.get_room_name(full=False),
            'location': event.venue_name,
            'address': event.address,
            'type': event.type_.legacy_name,
            'references': list(map(export_serialize_reference, event.references))
        }

    def _serialize_contribution(self, event, contribution):

        editable = self._serialize_editable(event, contribution)
        
        revisions = editable.get('revisions', None) if editable else []

        return {
            "id": contribution.id,
            "code": contribution.code,
            "title": contribution.title,
            "friendly_id": contribution.friendly_id,
            "revisions": revisions
        }

    def _serialize_editable(self, event, contrib):

        editable = (Editable.query
                    .with_parent(contrib)
                    .filter_by(type=1)
                    .first())

        if editable is not None:

            # revisions = self._get_all_revisions(event, contrib, editable)

            revisions = self._get_latest_revision(event, contrib, editable)

            return {
                "id": editable.id,
                "type": editable.type,
                "revisions": revisions
            }

        return None

    def _get_latest_revision(self, event, contrib, editable):
        latest_revision = editable.revisions[-1]

        serialized_revision = self._serialize_editable_revision(
            event, contrib, latest_revision)

        revisions = [serialized_revision]

        return revisions

    def _get_all_revisions(self, event, contrib, editable):
        elements = [
            self._serialize_editable_revision(
                event, contrib, revision)
            for revision in editable.revisions
        ]

        revisions = [el for el in elements if len(el.get('files', [])) > 0]
        
        return revisions
