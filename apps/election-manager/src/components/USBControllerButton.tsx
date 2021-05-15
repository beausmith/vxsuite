import React, { useContext } from 'react'
import { usbstick } from '@votingworks/utils'
import AppContext from '../contexts/AppContext'

import Button from './Button'

const { UsbDriveStatus } = usbstick

// eslint-disable-next-line @typescript-eslint/no-empty-function
const doNothing = () => {}

const USBControllerButton: React.FC<{ primary?: boolean; small?: boolean }> = ({
  primary = false,
  small = true,
}) => {
  const { usbDriveStatus: status, usbDriveEject } = useContext(AppContext)

  if (status === UsbDriveStatus.notavailable) {
    return null
  }

  if (status === UsbDriveStatus.absent) {
    return (
      <Button disabled small={small} onPress={doNothing}>
        No USB
      </Button>
    )
  }

  if (status === UsbDriveStatus.present) {
    return (
      <Button disabled small={small} onPress={doNothing}>
        Connecting…
      </Button>
    )
  }

  if (status === UsbDriveStatus.recentlyEjected) {
    return (
      <Button disabled small={small} onPress={doNothing}>
        Ejected
      </Button>
    )
  }

  if (status === UsbDriveStatus.ejecting) {
    return (
      <Button disabled small={small} onPress={doNothing}>
        Ejecting…
      </Button>
    )
  }

  return (
    <Button primary={primary} small={small} onPress={usbDriveEject}>
      Eject USB
    </Button>
  )
}

export default USBControllerButton
