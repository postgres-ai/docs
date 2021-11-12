import React from 'react'
import { Switch, Route } from '@docusaurus/router'
import { Collections } from './Collections'
import { CollectionDetail } from './CollectionDetail'
import { ROUTES } from '../routes'


const Universe: React.FC = () => {
  return (
    <Switch>
      <Route path={`${ROUTES.UNIVERSE.path}:id`} component={CollectionDetail} />
      <Route path={ROUTES.UNIVERSE.path} component={Collections} />
    </Switch>
  )
}

export default Universe
