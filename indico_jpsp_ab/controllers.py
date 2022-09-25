


from indico_jpsp_ab.services import ABCExportEvent
from indico_jpsp_ab.tests import TEST_EVENT_DATA
from indico_jpsp_ab.utils import json_encode

from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase

from indico.modules.events.management.views import WPEventManagement


from flask import g, request, session, make_response, jsonify


class RH_get_event_json(RHManageEventBase, ABCExportEvent):

    
    def _process(self):
        
        # return TEST_EVENT_DATA
        
        self.user = g.current_api_user = session.user       
        self.event = Event.get(request.view_args['event_id'])   
        
        if self.event.can_manage(session.user):
            return json_encode(self._build_event_api_data(self.event))
        
        return make_response('', 403)

class RH_get_ab_page(RHManageEventBase):
    
    def _process(self):
        
        self.user = g.current_api_user = session.user       
        self.event = Event.get(request.view_args['event_id'])
        
        if self.event.can_manage(session.user):
            return WPEventManagement.render_template('jpsp_ab:get.html', self.event)
        
        return make_response('', 403)


    