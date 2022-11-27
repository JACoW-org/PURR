from abc import ABC

from datetime import datetime
from operator import attrgetter
from sqlalchemy import Date, cast

from indico.util.date_time import iterdays
from indico.web.flask.util import url_for

from indico.core.db.sqlalchemy.protection import ProtectionMode

from indico.modules.events.timetable.models.entries import TimetableEntry

from indico_jpsp_ab.utils import DEFAULT_TIMEZONE

from indico_jpsp_ab.wrappers import build_folders_api_data__wrapper, \
    build_material_legacy_api_data__wrapper, build_note_api_data__wrapper, \
    build_note_legacy_api_data__wrapper

from indico_jpsp_ab.logger import logger



class ABCExportEvent(ABC):

    _detail_level = 'sessions'

    _fossils_mapping = {
        'event': {
            'events': 'conferenceMetadata',
            'contributions': 'conferenceMetadataWithContribs',
            'subcontributions': 'conferenceMetadataWithSubContribs',
            'sessions': 'conferenceMetadataWithSessions'
        },
        'contribution': {
            'contributions': 'contributionMetadata',
            'subcontributions': 'contributionMetadataWithSubContribs',
            'sessions': 'contributionMetadataWithSubContribs'
        },
        'block': {
            'sessions': 'sessionMetadata',
            'contributions': 'sessionMetadataWithContributions'
        },
        'person': {
            'Avatar': 'conferenceChairMetadata',
            'ConferenceChair': 'conferenceChairMetadata',
            'ContributionParticipation': 'contributionParticipationMetadata',
            'SubContribParticipation': 'contributionParticipationMetadata'
        }
    }

    def find_event_day_bounds(self, obj, day):
        if not (obj.start_dt_local.date() <= day <= obj.end_dt_local.date()):
            return None, None
        entries = obj.timetable_entries.filter(TimetableEntry.parent_id.is_(None),
                                               cast(TimetableEntry.start_dt.astimezone(obj.tzinfo), Date) == day).all()
        first = min(entries, key=attrgetter('start_dt')).start_dt if entries else None
        last = max(entries, key=attrgetter('end_dt')).end_dt if entries else None
        return first, last

    def _serialize_reference(self, reference):
        return {
            'type': reference.reference_type.name,
            'value': reference.value,
            'url': reference.url,
            'urn': reference.urn
        }

    # def _serialize_access_list(self, obj):
    #     data = {'users': [], 'groups': []}
    #     for manager in obj.get_access_list():
    #         if manager.principal_type in (PrincipalType.user, PrincipalType.email):
    #             data['users'].append(manager.email)
    #         elif manager.principal_type == PrincipalType.multipass_group:
    #             data['groups'].append(manager.name)
    #     return data

    def _serialize_date(self, date):
        if date:
            date = date.astimezone(DEFAULT_TIMEZONE)
            return {
                'date': str(date.date()),
                'time': str(date.time()),
                'tz': str(date.tzinfo)
            }

    def _build_event_api_data_base(self, event):
        return {
            '_type': 'Conference',
            'id': str(event.id),
            'title': event.title,
            'description': event.description,
            'start_dt': self._serialize_date(event.start_dt),
            'timezone': event.timezone,
            'end_dt': self._serialize_date(event.end_dt),
            'room': event.get_room_name(full=False),
            'location': event.venue_name,
            'address': event.address,
            'type': event.type_.legacy_name,
            'references': list(map(self._serialize_reference, event.references))
        }

    def _serialize_person(self, person, person_type):
        if person:
            return {
                '_type': person_type,
                '_fossil': self._fossils_mapping['person'].get(person_type, None),
                'first_name': person.first_name,
                'last_name': person.last_name,
                'id': str(person.id),
                'affiliation': person.affiliation,
                'email': person.email
            }

    def _serialize_persons(self, persons, person_type):
        return [self._serialize_person(person, person_type) for person in persons]


    def _serialize_field_value(self, field) :
        return {
            'name': field.contribution_field.title,
            'value': field.friendly_data
        }
    

    def _serialize_contribution(self, contrib):
        
        # start_date = datetime.now().timestamp()
        
        # folders = build_folders_api_data__wrapper(contrib)
        # 
        # logger.error(f'[delta] folders -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()
        # 
        # material = build_material_legacy_api_data__wrapper(contrib)
        # 
        # logger.error(f'[delta] material -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()
        
        speakers = self._serialize_persons(contrib.speakers, person_type='ContributionParticipation')
        
        # logger.info(f'[delta] speakers -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()
        
        primary_authors = self._serialize_persons(contrib.primary_authors, person_type='ContributionParticipation')
        
        # logger.info(f'[delta] primary_authors -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()
        
        coauthors = self._serialize_persons(contrib.secondary_authors, person_type='ContributionParticipation')
        
        # logger.info(f'[delta] coauthors -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()
        
        references = list(map(self._serialize_reference, contrib.references))
        
        # logger.info(f'[delta] references -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()
        
        sub_contributions = list(map(self._serialize_subcontribution, contrib.subcontributions))
        
        # logger.info(f'[delta] sub_contributions -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()
        
        field_values = list(map(self._serialize_field_value, contrib.field_values))
        
        # abstract = 
        
        return {
            '_type': 'Contribution',
            '_fossil': self._fossils_mapping['contribution'].get(self._detail_level),
            'id': (contrib.legacy_mapping.legacy_contribution_id
                   if contrib.legacy_mapping else str(contrib.friendly_id)),
            'db_id': contrib.id,
            'friendly_id': contrib.friendly_id,
            'field_values': field_values,
            'title': contrib.title,
            'start_dt': self._serialize_date(contrib.start_dt) if contrib.start_dt else None,
            'end_dt': self._serialize_date(contrib.start_dt + contrib.duration) if contrib.start_dt else None,
            'duration': contrib.duration.seconds // 60,
            'room_name': contrib.room_name,
            # 'room': contrib.get_room_name(full=False),
            # 'note': build_folders_api_data__wrapper(contrib.note),
            'location': contrib.venue_name,
            'type': contrib.type.name if contrib.type else None,
            'description': contrib.description,
            # 'folders': folders,
            'url': url_for('contributions.display_contribution', contrib, _external=True),
            # 'material': material,
            'speakers': speakers,
            'primary_authors': primary_authors,
            'coauthors': coauthors,
            'keywords': contrib.keywords,
            'track': contrib.track.title if contrib.track else None,
            # 'session': contrib.session.title if contrib.session else None,
            'references': references,
            'board_number': contrib.board_number,
            'code': contrib.code,
            'sub_contributions': sub_contributions
        }

    def _serialize_subcontribution(self, subcontrib):
        return {
            '_type': 'SubContribution',
            '_fossil': 'subContributionMetadata',
            'id': (subcontrib.legacy_mapping.legacy_subcontribution_id
                   if subcontrib.legacy_mapping else str(subcontrib.friendly_id)),
            'db_id': subcontrib.id,
            'friendly_id': subcontrib.friendly_id,
            'title': subcontrib.title,
            'duration': subcontrib.duration.seconds // 60,
            # 'note': build_note_api_data__wrapper(subcontrib.note),
            # 'material': build_material_legacy_api_data__wrapper(subcontrib),
            # 'folders': build_folders_api_data__wrapper(subcontrib),
            'speakers': self._serialize_persons(subcontrib.speakers, person_type='SubContribParticipation'),
            'references': list(map(self._serialize_reference, subcontrib.references)),
            'code': subcontrib.code,
        }

    def _serialize_convener(self, convener):
        return {
            # 'fax': '',
            # 'familyName': convener.last_name,
            # 'firstName': convener.first_name,
            # 'name': convener.get_full_name(last_name_upper=False, abbrev_first_name=False),
            # 'fullName': convener.get_full_name(last_name_upper=False, abbrev_first_name=False),
            '_type': 'SlotChair',
            '_fossil': 'conferenceParticipation',
            'id': convener.person_id,
            'db_id': convener.id,
            'title': convener.title,
            'last_name': convener.last_name,
            'first_name': convener.first_name,
            'affiliation': convener.affiliation,
            'person_id': convener.person_id,
            'address': convener.address,
            'phone': convener.phone,
            'email': convener.person.email,
        }

    # def _serialize_reservations(self, reservations):
    #     res = defaultdict(list)
    #     for resv in reservations:
    #         occurrences = (resv.occurrences
    #                        .filter(ReservationOccurrence.is_valid)
    #                        .options(ReservationOccurrence.NO_RESERVATION_USER_STRATEGY)
    #                        .all())
    #         res[resv.room.full_name] += [{'startDateTime': occ.start_dt, 'endDateTime': occ.end_dt}
    #                                      for occ in occurrences]
    #     return res

    # def _build_session_event_api_data(self, event):
    #     data = self._build_event_api_data_base(event)
    #     data.update({
    #         '_fossil': 'conference',
    #         'adjustedStartDate': self._serialize_date(event.start_dt_local),
    #         'adjustedEndDate': self._serialize_date(event.end_dt_local),
    #         'bookedRooms': self._serialize_reservations(event.reservations),
    #         'supportInfo': {
    #             '_fossil': 'supportInfo',
    #             'caption': event.contact_title,
    #             '_type': 'SupportInfo',
    #             'email': ', '.join(event.contact_emails),
    #             'telephone': ', '.join(event.contact_phones)
    #         },
    #     })
    #     return data

    # def _serialize_session_block(self, block, serialized_session, session_access_list = None)
    def _serialize_session_block(self, block, serialized_session):
        block_data = {
            '_type': 'SessionSlot',
            '_fossil': self._fossils_mapping['block'].get(self._detail_level),
            'id': block.id,  # TODO: Need to check if breaking the `session_id-block_id` format is OK
            # 'conference': self._build_session_event_api_data(block.event),
            'start_dt': self._serialize_date(block.timetable_entry.start_dt) if block.timetable_entry else None,
            'end_dt': self._serialize_date(block.timetable_entry.end_dt) if block.timetable_entry else None,
            'description': '',  # Session blocks don't have a description
            'title': block.full_title,
            'url': url_for('sessions.display_session', block.session, _external=True),
            'contributions': list(map(self._serialize_contribution, block.contributions)),
            'note': build_note_api_data__wrapper(block.note),
            'session': serialized_session,
            #'room': block.get_room_name(full=False),
            'room_name': block.room_name,
            'location': block.venue_name,
            #'inheritLoc': block.inherit_location,
            #'inheritRoom': block.own_room is None,
            'slot_title': block.title,
            'address': block.address,
            'conveners': [self._serialize_convener(c) for c in block.person_links],
            'code': block.code,
        }
        # if session_access_list:
        #     block_data['allowed'] = session_access_list
        return block_data

    def _calculate_occurrences(self, event):
        for day in iterdays(event.start_dt, event.end_dt):
            first_start, last_end = self.find_event_day_bounds(event, day.date())
            if first_start is not None:
                yield {'start_dt': first_start, 'end_dt': last_end}

    def _serialize_event_occurrences(self, event):
        return [
            {
                'start_dt': period['start_dt'].astimezone(DEFAULT_TIMEZONE),
                'end_dt': period['end_dt'].astimezone(DEFAULT_TIMEZONE),
                '_type': 'Period',
                '_fossil': 'period'
            }
            for period in self._calculate_occurrences(event)
        ]

    def _serialize_session(self, session_):
        return {
            '_type': 'Session',
            '_fossil': 'sessionMinimal',
            'id': (session_.legacy_mapping.legacy_session_id
                   if session_.legacy_mapping else str(session_.friendly_id)),
            'db_id': session_.id,
            'friendly_id': session_.friendly_id,
            'code': session_.code,
            'folders': build_folders_api_data__wrapper(session_),
            'start_dt': self._serialize_date(session_.start_dt) if session_.blocks else None,
            'end_dt': self._serialize_date(session_.end_dt) if session_.blocks else None,
            'session_conveners': [self._serialize_convener(c) for c in session_.conveners],
            'title': session_.title,
            'bg_color': f'#{session_.colors.background}',
            'text_color': f'#{session_.colors.text}',
            'description': session_.description,
            'material': build_material_legacy_api_data__wrapper(session_),
            'is_poster': session_.is_poster,
            'type': session_.type.name if session_.type else None,
            'url': url_for('sessions.display_session', session_, _external=True),
            'room_name': session_.room_name,
            'location': session_.venue_name,
            'address': session_.address,
            'num_slots': len(session_.blocks),
            # 'room': session_.get_room_name(full=False),
        }

    def _build_session_api_data(self, session_):
        s = self._serialize_session(session_)
        return [self._serialize_session_block(b, s) for b in session_.blocks]
        # session_access_list = self._serialize_access_list(session_)
        # return [self._serialize_session_block(b, serialized_session, session_access_list)
        #         for b in session_.blocks]

    def _build_event_api_data(self, event, contributions=True, sessions=True, occurrences=True):
        
        start_date = datetime.now().timestamp()
                
        data = self._build_event_api_data_base(event)
        
        logger.error(f'[delta] event -> {(datetime.now().timestamp() - start_date)}')
        start_date = datetime.now().timestamp()
        
        material_data = build_material_legacy_api_data__wrapper(event)
        
        logger.error(f'[delta] material_data -> {(datetime.now().timestamp() - start_date)}')
        start_date = datetime.now().timestamp()
        
        if legacy_note_material := build_note_legacy_api_data__wrapper(event.note):
            if material_data is not None:
                material_data.append(legacy_note_material)
            else:
                print('Error: material_data is None')
                
        logger.error(f'[delta] material_legacy ->: {(datetime.now().timestamp() - start_date)}')
        start_date = datetime.now().timestamp()
                
        data.update({
            '_fossil': self._fossils_mapping['event'].get(self._detail_level),
            'category_id': event.category_id,
            'category': event.category.title,
            'note': build_note_api_data__wrapper(event.note),
            'room_name': event.room_name,
            'url': event.external_url,
            'creation_dt': self._serialize_date(event.created_dt),
            'creator': self._serialize_person(event.creator, person_type='Avatar'),
            # 'hasAnyProtection': event.effective_protection_mode != ProtectionMode.public,
            #'room_map_url': event.room.map_url if event.room else None,
            'folders': build_folders_api_data__wrapper(event),
            'chairs': self._serialize_persons(event.person_links, person_type='ConferenceChair'),
            'material': material_data,
            'keywords': event.keywords,
            'organizer': event.organizer_info,
        })
        
        logger.error(f'[delta] update ->: {(datetime.now().timestamp() - start_date)}')
        start_date = datetime.now().timestamp()

        # event_category_path = event.category.chain
        # visibility = {'id': '', 'name': 'Everywhere'}
        # if event.visibility is None:
        #     pass  # keep default
        # elif event.visibility == 0:
        #     visibility['name'] = 'Nowhere'
        # elif event.visibility:
        #     try:
        #         path_segment = event_category_path[-event.visibility]
        #     except IndexError:
        #         pass
        #     else:
        #         visibility['id'] = path_segment['id']
        #         visibility['name'] = path_segment['title']
        # data['visibility'] = visibility

        # allow_details = contribution_settings.get(event, 'published') or True
        #
        # if self._detail_level in {'contributions', 'subcontributions'}:
        #     data['contributions'] = []
        #     if allow_details:
        #         for contribution in event.contributions:
        #             serialized_contrib = self._serialize_contribution(contribution)
        #             data['contributions'].append(serialized_contrib)
        #
        # elif self._detail_level == 'sessions':
        #     data['contributions'] = []
        #     data['sessions'] = []
        #     if allow_details:
        #         # Contributions without a session
        #         for contribution in event.contributions:
        #             if not contribution.session:
        #                 serialized_contrib = self._serialize_contribution(contribution)
        #                 data['contributions'].append(serialized_contrib)
        #
        #         for session_ in event.sessions:
        #             data['sessions'].extend(
        #                 self._build_session_api_data(session_))
        
        if contributions:

            data['contributions'] = []
            
            for contribution in event.contributions:
                serialized_contrib = self._serialize_contribution(contribution)
                data['contributions'].append(serialized_contrib)

            logger.error(f'[delta] contributions -> {(datetime.now().timestamp() - start_date)}')
            
        if sessions:
            
            start_date = datetime.now().timestamp()       
            
            data['sessions'] = []
            
            for session_ in event.sessions:
                data['sessions'].extend(
                    self._build_session_api_data(session_))
                
            logger.error(f'[delta] sessions -> {(datetime.now().timestamp() - start_date)}')
            
        
        if occurrences:
            
            start_date = datetime.now().timestamp()

            data['occurrences'] = self._serialize_event_occurrences(event)
            
            logger.error(f'[delta] occurrences -> {(datetime.now().timestamp() - start_date)}')
            
        
        return data
