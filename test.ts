// Minimal example for extension testing.
// This file is not included in normal user projects.
ina219.setAddress(ina219.Address.Addr40)
ina219.begin()

input.onButtonPressed(Button.A, function () {
    serial.writeValue("power_mW", ina219.power())
})
