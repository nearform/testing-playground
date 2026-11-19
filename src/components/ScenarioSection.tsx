import { Card } from '@nearform/quantum'
import React from 'react'

type ScenarioSectionProps = React.ComponentPropsWithoutRef<'section'>

// One set of demos on a scenario page that has several. Each set is its own
// card, so the page background between them shows where one set ends and the
// next begins. Use it with PageSetup's sections option, which leaves out the
// single card that would otherwise hold the whole playground.
const ScenarioSection: React.FC<ScenarioSectionProps> = ({
  className,
  ...props
}) => (
  // Card merges its classes with these, so a section can still set its own
  // border, layout or spacing
  <Card asChild className={`flex flex-col gap-4 md:p-6 ${className ?? ''}`}>
    <section {...props} />
  </Card>
)

export default ScenarioSection
