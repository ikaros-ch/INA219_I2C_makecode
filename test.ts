ina219.setAddress(ina219.Address.Addr40)
ina219.begin()

basic.forever(function () {
    serial.writeValue("bus_V", ina219.busVoltage())
    serial.writeValue("shunt_mV", ina219.shuntVoltage())
    serial.writeValue("current_mA", ina219.current())
    serial.writeValue("power_mW", ina219.power())
    basic.pause(1000)
})
