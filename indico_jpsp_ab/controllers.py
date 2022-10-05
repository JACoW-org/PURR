


from indico_jpsp_ab.services.export_event import ABCExportEvent
from indico_jpsp_ab.services.export_event_files import ABCExportEventFiles

from indico_jpsp_ab.utils import json_encode



from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase

from indico.modules.events.editing.controllers.base import RHEditableTypeEditorBase

from indico.modules.events.management.views import WPEventManagement

from indico.modules.events.editing.schemas import EditingEditableListSchema


from flask import g, request, session, make_response


class RH_get_event_files_json(RHManageEventBase, ABCExportEventFiles):
    """Return the list of editables of the event for a given type."""
    
    # def _process_args(self):
    #     RHEditableTypeEditorBase._process_args(self)
    #     
    #     # self.contributions = (Contribution.query
    #     #                       .with_parent(self.event)
    #     #                       .options(joinedload('editables'))
    #     #                       .order_by(Contribution.friendly_id)
    #     #                       .all())

    def _process(self):
        
        self.user = g.current_api_user = session.user       
        self.event = Event.get(request.view_args['event_id'])  
        
        if self.event.can_manage(session.user):
            return json_encode(self._build_event_files_api_data(self.event))
        
        return make_response('', 403)
        
        # return (EditingEditableListSchema(many=True, context={'editable_type': self.editable_type})
        #         .jsonify(self.contributions))


class RH_get_event_json(RHManageEventBase, ABCExportEvent):
    """ """
    
    def _process(self):
        
        self.user = g.current_api_user = session.user       
        self.event = Event.get(request.view_args['event_id'])   
        
        if self.event.can_manage(session.user):
            return json_encode(self._build_event_api_data(self.event))
        
        return make_response('', 403)
    

class RH_jpsp_home_page(RHManageEventBase):
    """ """
    
    def _process(self):
        
        self.user = g.current_api_user = session.user       
        self.event = Event.get(request.view_args['event_id'])
        
        if self.event.can_manage(session.user):
            return WPEventManagement.render_template('jpsp_ab:get.html', self.event)
        
        return make_response('', 403)


    