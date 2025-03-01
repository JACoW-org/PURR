from operator import attrgetter
from flask_pluginengine import current_plugin

from sqlalchemy import Date, cast
from sqlalchemy.orm import joinedload

from indico.modules.events.models.events import Event
from indico.modules.events.sessions.models.sessions import Session
from indico.modules.attachments.models.attachments import Attachment
from indico.modules.attachments.models.folders import AttachmentFolder
from indico.modules.events.contributions.models.contributions import Contribution
from indico.modules.events.editing.models.editable import Editable
from indico.modules.events.timetable.models.entries import TimetableEntry
from indico.modules.events.sessions.models.blocks import SessionBlock
from indico.modules.events.sessions.models.persons import SessionBlockPersonLink
from indico.web.flask.util import url_for

from indico_purr.services.exporter.abstract_file_exporter import ABCExportFile
from indico_purr.services.exporter.common_exporter_utils import (
    export_serialize_date,
    export_serialize_reference,
)


class ABCExportEvent(ABCExportFile):
    """ """

    def _export_event_data(self, event):
        event_data = self._build_event_api_data_base(event)

        return event_data

    def _export_event_sessions_data(self, event):
        sessions_data = []

        # sd = (Session.query
        #          .options(
        #              joinedload("conveners").joinedload("jacow_affiliations")
        #          )
        #          .filter_by(event_id=event.id)
        #         #  .order_by()
        #          .all())

        for session in event.sessions:
            serialized = self._serialize_session(event, session)
            serialized_sessions = [
                self._serialize_session_block(event, block, serialized)
                for block in session.blocks
            ]

            sessions_data.extend(serialized_sessions)

        return sessions_data
    
    # def get_conveners(session_id):

    #     return (SessionBlockPersonLink.query
    #             .join(SessionBlock)
    #             .filter(SessionBlock.session_id == session_id)
    #             .distinct(SessionBlockPersonLink.person_id)
    #             .all())

    def find_attachments_list(self, event):
        event_folders = AttachmentFolder.query.filter_by(
            event=event, is_deleted=False
        ).all()

        folder_ids = [f.id for f in event_folders if f.title == "final_proceedings"]

        event_attachments = Attachment.query.filter(
            ~Attachment.is_deleted, Attachment.folder_id.in_(folder_ids)
        ).all()

        return event_attachments

    def find_contributions_list(self, event, session_block_id, files):
        query = Contribution.query.with_parent(event)

        if files:
            query.options(joinedload("editables"))

        query.options(
            joinedload("speakers").joinedload("jacow_affiliations"),
            joinedload("primary_authors").joinedload("jacow_affiliations"),
            joinedload("secondary_authors").joinedload("jacow_affiliations")
        )

        event_contributions = (
            (
                query.filter_by(is_deleted=False, session_block_id=session_block_id)
                .order_by(Contribution.friendly_id)
                .all()
            )
            if session_block_id
            else (
                query.filter_by(is_deleted=False)
                .order_by(Contribution.friendly_id)
                .all()
            )
        )

        return event_contributions

    def find_event_day_bounds(self, obj, day):
        if not (obj.start_dt_local.date() <= day <= obj.end_dt_local.date()):
            return None, None

        entries = obj.timetable_entries.filter(
            TimetableEntry.parent_id.is_(None),
            cast(TimetableEntry.start_dt.astimezone(obj.tzinfo), Date) == day,
        ).all()

        first = min(entries, key=attrgetter("start_dt")).start_dt if entries else None
        last = max(entries, key=attrgetter("end_dt")).end_dt if entries else None

        return first, last

    def _build_event_api_data_base(self, event):
        
      event_data = self._get_event_data(event.id)

      return {
          "id": str(event.id),
          "title": event.title,
          "description": event.description,
          "start_dt": export_serialize_date(event.start_dt, event.timezone),
          "end_dt": export_serialize_date(event.end_dt, event.timezone),
          "timezone": event.timezone,
          "room": event.get_room_name(full=False),
          "location": event.venue_name,
          "address": event.address,
          "category": event.category.title,
          "room_name": event.room_name,
          "url": event.external_url,
          "creation_dt": export_serialize_date(event.created_dt, event.timezone),
          "creator": self._serialize_person(event_data.creator),
          "chairs": self._serialize_persons(event_data.person_links),
          # 'material': material_data,
          "keywords": event.keywords,
          "organizer": event.organizer_info,
          "references": list(map(export_serialize_reference, event.references)),
      }
    
    def _get_event_data(self, event_id):
      # retrieve affiliations for creator and chairs
      query = Event.query

      query.options(
          joinedload("creator").joinedload("jacow_affiliations"),
          joinedload("person_links").joinedload("jacow_affiliations")
      )

      event_data = query.get(event_id)

      return event_data

    def _serialize_person_affiliation(self, person):
        if not person:
            return None
        
        return {"name": person.affiliation}
    
    def _serialize_person_affiliations(self, person):
        if not person:
            return None
        
        return [{"name": jacow_affiliation.affiliation.name} for jacow_affiliation in person.jacow_affiliations]

    def _serialize_person(self, person):

        multiple_affiliations = []
        if person and hasattr(person, "jacow_affiliations"):
            for aff in person.jacow_affiliations:
                multiple_affiliations.append(aff.affiliation.name)

        return (
            {
                "id": str(person.id),
                "email": person.email,
                "first_name": person.first_name,
                "last_name": person.last_name,
                "affiliation": person.affiliation,
                "multiple_affiliations": multiple_affiliations
            }
            if person else None
        )

    def _serialize_institutes(self, persons):
        
        institutes = []
        for person in persons:
            if hasattr(person, "jacow_affiliations"):
                institutes.extend(self._serialize_person_affiliations(person))
            institutes.append(self._serialize_person_affiliation(person))
        
        return institutes

    def _serialize_persons(self, persons):
        return [self._serialize_person(person)
                for person in persons]

    def _serialize_field_value(self, field):
        return {"name": field.contribution_field.title,
                "value": field.friendly_data}

    def _serialize_contribution(self, event, contrib):
        institutes = self._serialize_institutes(contrib.primary_authors)

        speakers = self._serialize_persons(contrib.speakers)

        primary_authors = self._serialize_persons(contrib.primary_authors)

        coauthors = self._serialize_persons(contrib.secondary_authors)

        sub_contributions = [
            self._serialize_subcontribution(c)
            for c in contrib.subcontributions
        ]

        field_values = [self._serialize_field_value(f)
                        for f in contrib.field_values]

        editables = self._serialize_editables(event, contrib)

        paper = self._serialize_paper(contrib)

        session_code = ""
        if contrib.session_block:
            if contrib.session_block.code:
                session_code = contrib.session_block.code
            else:
                session_code = contrib.session_block.session.code

        session_id = contrib.session_block.id

        return {
            "id": (
                contrib.legacy_mapping.legacy_contribution_id
                if contrib.legacy_mapping
                else str(contrib.friendly_id)
            ),
            "friendly_id": contrib.friendly_id,
            "field_values": field_values,
            "title": contrib.title,
            "paper": paper,
            # "revision": contrib._paper_last_revision,
            "start_dt": export_serialize_date(contrib.start_dt,
                                              event.timezone)
            if contrib.start_dt
            else None,
            "end_dt": export_serialize_date(contrib.start_dt + contrib.duration,
                                            event.timezone)
            if contrib.start_dt
            else None,
            "duration": contrib.duration.seconds // 60,
            "room_name": contrib.room_name,
            "location": contrib.venue_name,
            "type": contrib.type.name if contrib.type else None,
            "description": contrib.description,
            "url": url_for(
                "contributions.display_contribution", contrib, _external=True
            ),
            "speakers": speakers,
            "primary_authors": primary_authors,
            "coauthors": coauthors,
            "track": self._serialize_track_data(contrib),
            "institutes": institutes,
            "code": contrib.code,
            "session_id": session_id,
            "session_code": session_code,
            "sub_contributions": sub_contributions,
            "editables": editables,
        }

    def _serialize_paper(self, contrib):

        # if contrib.paper:
        #     current_plugin.logger.debug(
        #         f"code: {contrib.code} - title: {contrib.paper.title} - state: {contrib.paper.state}")
        # else:
        #     current_plugin.logger.debug(f"code: {contrib.code} - no paper")

        return {
            "title": contrib.paper.title,
            "state": contrib.paper.state,
            "verbose_title": contrib.paper.verbose_title,
            "last_revision": self._serialize_paper_revison(
                contrib.paper.last_revision),
        } if contrib.paper else None

    def _serialize_paper_revison(self, paper_revision):
        return {
            "judgment_comment": paper_revision.judgment_comment,
        } if paper_revision else None

    def _serialize_track_data(self, contrib):
        track = None

        if contrib.track:
            track = dict(
                code=contrib.track.code,
                title=contrib.track.title,
                description=contrib.track.description,
                position=contrib.track.position,
            )

            if contrib.track.track_group:
                track.update(
                    dict(
                        group=dict(
                            title=contrib.track.track_group.title,
                            description=contrib.track.track_group.description,
                            position=contrib.track.track_group.position,
                        )
                    )
                )

        return track

    def _serialize_editables(self, event, contrib):

        editables = (
            Editable.query.with_parent(contrib)
            .filter(Editable.type.in_([1, 2, 3]))
            .all()
        )

        return (
            [
                {
                    "id": str(editable.id),
                    "type": editable.type,
                    "state": editable.state,
                    "all_revisions": self._get_all_revisions(
                        event, contrib, editable),
                    "latest_revision": self._get_latest_revision(
                        event, contrib, editable
                    ),
                }
                for editable in editables
            ]
            if len(editables) > 0
            else []
        )

    def _get_latest_revision(self, event, contrib, editable):
        serialized_revision = self._serialize_editable_revision(
            event, contrib, editable.latest_revision_with_files, True
        )

        return serialized_revision

    def _get_all_revisions(self, event, contrib, editable):
        revisions = [
            self._serialize_editable_revision(event, contrib, revision, True)
            for revision in editable.valid_revisions
        ]

        return revisions

    def _serialize_subcontribution(self, subcontrib):
        return {
            "id": (
                subcontrib.legacy_mapping.legacy_subcontribution_id
                if subcontrib.legacy_mapping
                else str(subcontrib.friendly_id)
            ),
            "friendly_id": subcontrib.friendly_id,
            "title": subcontrib.title,
            "duration": subcontrib.duration.seconds // 60,
            "speakers": self._serialize_persons(subcontrib.speakers),
            "references": list(map(export_serialize_reference, subcontrib.references)),
            "code": subcontrib.code,
        }

    def _serialize_convener(self, convener):
        return {
            "id": convener.person_id,
            "title": convener.title,
            "last_name": convener.last_name,
            "first_name": convener.first_name,
            "affiliation": convener.affiliation,
            "person_id": convener.person_id,
            "address": convener.address,
            "phone": convener.phone,
            "email": convener.person.email,
            "multiple_affiliations": [],  # TODO
        }

    def _serialize_session_block(self, event, block, serialized_session,
                                 event_contributions=[]):

        def _contribution_filter(contribution):
            return block.id == contribution.session_block_id

        contributions = filter(_contribution_filter, event_contributions)

        block_data = {
            "start_dt": export_serialize_date(block.timetable_entry.start_dt, event.timezone)
            if block.timetable_entry
            else None,
            "end_dt": export_serialize_date(block.timetable_entry.end_dt, event.timezone)
            if block.timetable_entry
            else None,
            # 'description': '',  # Session blocks don't have a description
            "title": block.full_title,
            "url": url_for("sessions.display_session", block.session, _external=True),
            # list(map(self._serialize_contribution, contributions)),
            "contributions": [
                self._serialize_contribution(event, c) for c in contributions
            ],
            # 'note': build_note_api_data__wrapper(block.note),
            "session": serialized_session,
            # 'room': block.get_room_name(full=False),
            "room_name": block.room_name,
            "location": block.venue_name,
            # 'inheritLoc': block.inherit_location,
            # 'inheritRoom': block.own_room is None,
            "slot_title": block.title,
            "address": block.address,
            "conveners": [self._serialize_convener(c) for c in block.person_links],
            "code": block.code if block.code else serialized_session.get("code", ""),
            "id": block.id,
        }

        return block_data

    def _serialize_session(self, event, session):

        return {
            "id": (
                session.legacy_mapping.legacy_session_id
                if session.legacy_mapping
                else str(session.friendly_id)
            ),
            # 'db_id': session_.id,
            "friendly_id": session.friendly_id,
            "code": session.code,
            "start_dt": export_serialize_date(session.start_dt, event.timezone)
            if session.blocks
            else None,
            "end_dt": export_serialize_date(session.end_dt, event.timezone)
            if session.blocks
            else None,
            "session_conveners": [
                self._serialize_convener(c) for c in session.conveners
            ],
            "title": session.title,
            "description": session.description,
            "is_poster": session.is_poster,
            "type": session.type.name if session.type else None,
            "url": url_for("sessions.display_session", session, _external=True),
            "room_name": session.room_name,
            "location": session.venue_name,
            "address": session.address,
            "num_slots": len(session.blocks),
        }
