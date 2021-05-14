import React from 'react'
import { render } from '@testing-library/react'
import { MemoryStorage, MemoryCard, MemoryHardware } from '@votingworks/utils'

import App from './App'
import DemoApp, { getSampleStorage } from './DemoApp'
import { activationStorageKey, electionStorageKey } from './AppRoot'

import {
  election,
  setElectionInStorage,
  setStateInStorage,
} from '../test/helpers/election'
import { advanceTimersAndPromises } from '../test/helpers/smartcards'
import { fakeMachineConfigProvider } from '../test/helpers/fakeMachineConfig'

jest.useFakeTimers()

beforeEach(() => {
  window.location.href = '/'
})

describe('loads election', () => {
  it('Machine is not configured by default', async () => {
    const hardware = await MemoryHardware.buildStandard()
    const { getByText } = render(
      <App
        machineConfig={fakeMachineConfigProvider()}
        card={new MemoryCard()}
        hardware={hardware}
      />
    )

    // Let the initial hardware detection run.
    await advanceTimersAndPromises()

    getByText('Device Not Configured')
  })

  it('from storage', async () => {
    const card = new MemoryCard()
    const storage = new MemoryStorage()
    const machineConfig = fakeMachineConfigProvider()
    const hardware = await MemoryHardware.buildStandard()
    setElectionInStorage(storage)
    setStateInStorage(storage)
    const { getByText } = render(
      <App
        card={card}
        storage={storage}
        machineConfig={machineConfig}
        hardware={hardware}
      />
    )

    // Let the initial hardware detection run.
    await advanceTimersAndPromises()

    getByText(election.title)
    expect(storage.get(electionStorageKey)).toBeTruthy()
  })

  it('sample app loads election and activates ballot', async () => {
    const storage = getSampleStorage()
    const { getAllByText, getByText } = render(<DemoApp storage={storage} />)

    // Let the initial hardware detection run.
    await advanceTimersAndPromises()
    await advanceTimersAndPromises()

    expect(getAllByText(election.title).length).toBeGreaterThan(1)
    getByText(/Center Springfield/)
    getByText(/ballot style 12/)
    expect(storage.get(electionStorageKey)).toBeTruthy()
    expect(storage.get(activationStorageKey)).toBeTruthy()
  })
})
