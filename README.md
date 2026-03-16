# pxt-ina219

MakeCode extension for the INA219 current / voltage / power monitor.

## Import

In MakeCode for micro:bit:

1. Open **Extensions**.
2. Paste your GitHub repository URL.
3. Import the extension.

## Example

```typescript
ina219.setAddress(ina219.Address.Addr40)
ina219.begin()

basic.forever(function () {
    serial.writeValue("V", ina219.busVoltage())
    serial.writeValue("mA", ina219.current())
    serial.writeValue("mW", ina219.power())
    basic.pause(1000)
})
```

## Notes

- Default calibration assumes a **0.1 ohm shunt** and about **2 A max current**.
- If your breakout uses a different shunt resistor or current range, call `ina219.setCalibration(shuntOhms, maxCurrentA)`.
