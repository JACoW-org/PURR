
from indico_purr.services.export.export_file import ABCExportFile

from sqlalchemy.orm import joinedload

from indico.modules.events.contributions.models.contributions import Contribution
from indico.modules.events.editing.models.editable import Editable


class ABCExportRevisionFile(ABCExportFile):
    """ """

    def _build_event_files_api_data(self, event, contrib_id, type, revision_id):
   
        contribution = (Contribution.query
                         .with_parent(event)
                         .options(joinedload('editables'))
                         .filter_by(id=contrib_id)
                         .order_by(Contribution.friendly_id)
                         .first())

        element = self._serialize_contribution(event, contribution, type, revision_id)

        return element.get('revisions', None)

    def _serialize_contribution(self, event, contribution, type, revision_id):

        editable = self._serialize_editable(event, contribution, type, revision_id)

        return {
            "id": contribution.id,
            "code": contribution.code,
            "title": contribution.title,
            "friendly_id": contribution.friendly_id,
            "revisions":  editable.get('revisions', None) if editable else None
        }

    def _serialize_editable(self, event, contribution, type, revision_id):

        editable = (Editable.query
                    .with_parent(contribution)
                    .filter_by(type=1)
                    .first())

        revisions = [rev for rev in editable.revisions if rev.id == revision_id]

        if editable is not None:

            elements = [
                self._serialize_editable_revision(
                    event, contribution, revision)
                for revision in revisions
            ]

            return {
                "id": editable.id,
                "type": editable.type,
                # "revision": self._serialize_editable_revision(event, contribution, editable.revisions[-1]),
                "revisions": [el for el in elements if len(el.get('files', [])) > 0]
            }

        return None

    
