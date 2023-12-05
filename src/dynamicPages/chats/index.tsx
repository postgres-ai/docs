import React from 'react'
import { Switch, Route } from 'react-router-dom'

import { Chatscontent } from './ChatsContent'
import { ROUTES } from '../routes'

const Chats: React.FC = () => {
  return (
    <Switch>
      <Route path={`${ROUTES.CHATS.path}:id`} component={Chatscontent} />
    </Switch>
  )
}

export default Chats
