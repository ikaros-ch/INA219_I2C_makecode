# INA219 MakeCode extension

MakeCode extension for the INA219 current / power monitor.

## Blocks

- `INA219 set address ...`
- `INA219 begin`
- `INA219 set calibration shunt ... ohm max current ... A`
- `INA219 bus voltage (V)`
- `INA219 shunt voltage (mV)`
- `INA219 current (mA)`
- `INA219 power (mW)`
- `INA219 reset`

## Notes

- `test.ts` is only for extension testing and is not included in normal user projects.
- Current and power calibration now use the INA219 calibration equations directly.
- If you use a `0.1 ohm` shunt, then `current (mA)` should closely match `shunt voltage (mV) / 0.1`.

## Example

```typescript
ina219.setAddress(ina219.Address.Addr40)
ina219.begin()
ina219.setCalibration(0.1, 0.5)

input.onButtonPressed(Button.A, function () {
    serial.writeValue("power_mW", ina219.power())
})
```
