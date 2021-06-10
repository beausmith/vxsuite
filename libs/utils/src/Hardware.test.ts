import { fakeKiosk, fakeDevice, fakePrinterInfo } from '@votingworks/test-utils'
import {
  getHardware,
  KioskHardware,
  MemoryHardware,
  isCardReader,
  OmniKeyCardReaderVendorId,
  OmniKeyCardReaderProductId,
  OmniKeyCardReaderDeviceName,
  OmniKeyCardReaderManufacturer,
  isAccessibleController,
  AccessibleControllerVendorId,
  AccessibleControllerProductId,
} from './Hardware'

describe('KioskHardware', () => {
  it('is used by getHardware when window.kiosk is set', async () => {
    try {
      window.kiosk = fakeKiosk()
      const hardware = await getHardware()
      expect(hardware).toBeInstanceOf(KioskHardware)
    } finally {
      window.kiosk = undefined
    }
  })

  it('is not used by getHardware when window.kiosk is not set', async () => {
    expect(window.kiosk).toBeUndefined()
    const hardware = await getHardware()
    expect(hardware).not.toBeInstanceOf(KioskHardware)
  })

  it('reads battery status from kiosk', async () => {
    const kiosk = fakeKiosk()
    const hardware = new KioskHardware(kiosk)
    await hardware.readBatteryStatus()
    expect(kiosk.getBatteryInfo).toHaveBeenCalledTimes(1)
  })

  it('reports printer status as connected if there are any connected printers', async () => {
    const kiosk = fakeKiosk()
    const hardware = new KioskHardware(kiosk)

    kiosk.getPrinterInfo.mockResolvedValueOnce([
      fakePrinterInfo({ connected: false }),
      fakePrinterInfo({ connected: true }),
    ])

    expect(await hardware.readPrinterStatus()).toEqual({ connected: true })
  })

  it('reports printer status as not connected if there are no connected printers', async () => {
    const kiosk = fakeKiosk()
    const hardware = new KioskHardware(kiosk)

    kiosk.getPrinterInfo.mockResolvedValueOnce([
      fakePrinterInfo({ connected: false }),
    ])

    expect(await hardware.readPrinterStatus()).toEqual({ connected: false })
  })
})

describe('MemoryHardware', () => {
  it('has a standard config with all the typical hardware', async (done) => {
    const hardware = await MemoryHardware.buildStandard()

    hardware.devices.subscribe((devices) => {
      expect(
        new Set(Array.from(devices).map((device) => device.deviceName))
      ).toEqual(
        new Set([
          OmniKeyCardReaderDeviceName,
          'USB Advanced Audio Device',
          'HL-L5100DN_series',
        ])
      )

      done()
    })
  })

  it('has no connected devices by default', async (done) => {
    const hardware = await MemoryHardware.build()

    hardware.devices.subscribe((devices) => {
      expect(Array.from(devices)).toEqual([])
      done()
    })
  })

  it('does not have devices that have not been added', async () => {
    const hardware = await MemoryHardware.build()
    expect(hardware.hasDevice(fakeDevice())).toBe(false)
  })

  it('has devices that have been added', async () => {
    const hardware = await MemoryHardware.build()
    const device = fakeDevice()

    hardware.addDevice(device)
    expect(hardware.hasDevice(device)).toBe(true)
  })

  it('sets connected to true by adding a missing device', async () => {
    const hardware = await MemoryHardware.build()
    const device = fakeDevice()

    jest.spyOn(hardware, 'addDevice')
    hardware.setDeviceConnected(device, true)
    expect(hardware.hasDevice(device)).toBe(true)
    expect(hardware.addDevice).toHaveBeenCalledWith(device)
  })

  it('does nothing when setting connected to true for an already added device', async () => {
    const hardware = await MemoryHardware.build()
    const device = fakeDevice()

    hardware.addDevice(device)
    jest.spyOn(hardware, 'addDevice')
    hardware.setDeviceConnected(device, true)
    expect(hardware.hasDevice(device)).toBe(true)
    expect(hardware.addDevice).not.toHaveBeenCalled()
  })

  it('sets connected to false by removing a connected device', async () => {
    const hardware = await MemoryHardware.build()
    const device = fakeDevice()

    hardware.addDevice(device)
    jest.spyOn(hardware, 'removeDevice')
    hardware.setDeviceConnected(device, false)
    expect(hardware.hasDevice(device)).toBe(false)
    expect(hardware.removeDevice).toHaveBeenCalledWith(device)
  })

  it('does nothing when setting connected to false for an already missing device', async () => {
    const hardware = await MemoryHardware.build()
    const device = fakeDevice()

    jest.spyOn(hardware, 'removeDevice')
    hardware.setDeviceConnected(device, false)
    expect(hardware.hasDevice(device)).toBe(false)
    expect(hardware.removeDevice).not.toHaveBeenCalled()
  })

  it('triggers callbacks when adding devices', async () => {
    const hardware = await MemoryHardware.build()
    const callback = jest.fn()
    const device = fakeDevice()

    hardware.devices.subscribe(callback)
    hardware.addDevice(device)
    expect(callback).toHaveBeenCalledWith(new Set([device]))
  })

  it('triggers callbacks when removing devices', async () => {
    const hardware = await MemoryHardware.build()
    const callback = jest.fn()
    const device = fakeDevice()

    hardware.addDevice(device)

    hardware.devices.subscribe(callback)
    expect(callback).toHaveBeenNthCalledWith(1, new Set([device]))

    hardware.removeDevice(device)
    expect(callback).toHaveBeenNthCalledWith(2, new Set([]))
  })

  it('throws when adding the same device twice', async () => {
    const hardware = await MemoryHardware.build()
    const device = fakeDevice()

    hardware.addDevice(device)
    expect(() => hardware.addDevice(device)).toThrowError(/already added/)
  })

  it('throws when removing a device that was never added', async () => {
    const hardware = await MemoryHardware.build()
    const device = fakeDevice()

    expect(() => hardware.removeDevice(device)).toThrowError(/never added/)
  })

  it('allows unsubscribing from a device subscription', async () => {
    const hardware = await MemoryHardware.build()
    const callback = jest.fn()
    const device = fakeDevice()

    hardware.devices.subscribe(callback).unsubscribe()
    callback.mockClear()

    hardware.addDevice(device)
    expect(callback).not.toHaveBeenCalled()
  })

  it('reports printer status as connected if there are any connected printers', async () => {
    const hardware = await MemoryHardware.build()
    await hardware.setPrinterConnected(true)
    expect(await hardware.readPrinterStatus()).toEqual({ connected: true })
  })

  it('reports printer status as not connected if there are no connected printers', async () => {
    const hardware = await MemoryHardware.build()
    await hardware.setPrinterConnected(false)
    expect(await hardware.readPrinterStatus()).toEqual({ connected: false })
  })

  it('can set and read battery level', async () => {
    const hardware = await MemoryHardware.build()
    expect(await hardware.readBatteryStatus()).toEqual({
      discharging: false,
      level: 0.8,
    })
    await hardware.setBatteryLevel(0.25)
    expect(await hardware.readBatteryStatus()).toEqual({
      discharging: false,
      level: 0.25,
    })
    await hardware.setBatteryDischarging(true)
    expect(await hardware.readBatteryStatus()).toEqual({
      discharging: true,
      level: 0.25,
    })
  })
})

describe('isCardReader', () => {
  it('does not match just any device', () => {
    expect(isCardReader(fakeDevice())).toBe(false)
  })

  it('matches a device with the right vendor ID and product ID', () => {
    expect(
      isCardReader(
        fakeDevice({
          vendorId: OmniKeyCardReaderVendorId,
          productId: OmniKeyCardReaderProductId,
        })
      )
    ).toBe(true)
  })

  it('matches a device with the right product name and manufacturer (using spaces)', () => {
    expect(
      isCardReader(
        fakeDevice({
          deviceName: OmniKeyCardReaderDeviceName,
          manufacturer: OmniKeyCardReaderManufacturer,
        })
      )
    ).toBe(true)
  })

  it('matches a device with the right product name and manufacturer (using underscores)', () => {
    expect(
      isCardReader(
        fakeDevice({
          deviceName: OmniKeyCardReaderDeviceName.replace(/ /g, '_'),
          manufacturer: OmniKeyCardReaderManufacturer.replace(/ /g, '_'),
        })
      )
    ).toBe(true)
  })
})

describe('isAccessibleController', () => {
  it('does not match just any device', () => {
    expect(isAccessibleController(fakeDevice())).toBe(false)
  })

  it('matches a device with the right vendor and product id', () => {
    expect(
      isAccessibleController(
        fakeDevice({
          vendorId: AccessibleControllerVendorId,
          productId: AccessibleControllerProductId,
        })
      )
    ).toBe(true)
  })
})