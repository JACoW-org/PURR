from indico_jpsp_ab.services.export_file import ABCExportFile

from sqlalchemy.orm import joinedload

from indico.modules.events.contributions.models.contributions import Contribution
from indico.modules.events.editing.models.editable import Editable

from indico.modules.events.editing.models.revision_files import EditingRevisionFile
from indico.modules.events.editing.models.revisions import EditingRevision, InitialRevisionState

from indico.web.flask.util import url_for


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

        return [el for el in elements if el.get('revisions', None) is not None]

    def _serialize_contribution(self, event, contribution):

        editable = self._serialize_editable(event, contribution)

        return {
            "id": contribution.id,
            "code": contribution.code,
            "title": contribution.title,
            "friendly_id": contribution.friendly_id,
            "revisions":  editable.get('revisions', None) if editable else None
        }

    def _serialize_editable(self, event, contribution):

        editable = (Editable.query
                    .with_parent(contribution)
                    .filter_by(type=1)
                    .first())

        if editable is not None:

            elements = [
                self._serialize_editable_revision(
                    event, contribution, revision)
                for revision in editable.revisions
            ]

            return {
                "id": editable.id,
                "type": editable.type,
                # "revision": self._serialize_editable_revision(event, contribution, editable.revisions[-1]),
                "revisions": [el for el in elements if len(el.get('files', [])) > 0]
            }

        return None
