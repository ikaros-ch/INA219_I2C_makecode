/**
 * MakeCode extension for the INA219 current / power monitor.
 * Uses the INA219 calibration equations from the TI datasheet.
 */

//% weight=100 color=#0fbc11 icon="\uf0e7" block="INA219"
namespace ina219 {
    const REG_CONFIG = 0x00
    const REG_SHUNT_VOLTAGE = 0x01
    const REG_BUS_VOLTAGE = 0x02
    const REG_POWER = 0x03
    const REG_CURRENT = 0x04
    const REG_CALIBRATION = 0x05

    const CONFIG_RESET = 0x8000
    const CONFIG_32V_320MV_12BIT_8S_CONTINUOUS = 0x3DDF

    let deviceAddress = 0x40
    let currentLSB_A = 0.0001
    let powerLSB_W = 0.002
    let calibrationValue = 4096
    let initialized = false

    export enum Address {
        //% block="0x40"
        Addr40 = 0x40,
        //% block="0x41"
        Addr41 = 0x41,
        //% block="0x44"
        Addr44 = 0x44,
        //% block="0x45"
        Addr45 = 0x45
    }

    function writeRegister(reg: number, value: number): void {
        const buf = pins.createBuffer(3)
        buf[0] = reg & 0xff
        buf[1] = (value >> 8) & 0xff
        buf[2] = value & 0xff
        pins.i2cWriteBuffer(deviceAddress, buf, false)
    }

    function readRegisterU16(reg: number): number {
        pins.i2cWriteNumber(deviceAddress, reg, NumberFormat.UInt8BE, true)
        return pins.i2cReadNumber(deviceAddress, NumberFormat.UInt16BE, false)
    }

    function readRegisterS16(reg: number): number {
        let value = readRegisterU16(reg)
        if (value > 0x7fff) value -= 0x10000
        return value
    }

    function applyCalibration(): void {
        writeRegister(REG_CALIBRATION, calibrationValue)
    }

    function ensureInit(): void {
        if (!initialized) {
            begin()
        }
    }

    /**
     * Select the INA219 I2C address.
     */
    //% blockId=ina219_set_address block="INA219 set address %addr"
    //% weight=95
    export function setAddress(addr: Address): void {
        deviceAddress = addr
        initialized = false
    }

    /**
     * Initialize the sensor with a common 32 V / 2 A calibration.
     */
    //% blockId=ina219_begin block="INA219 begin"
    //% weight=90
    export function begin(): void {
        writeRegister(REG_CONFIG, CONFIG_RESET)
        basic.pause(1)
        writeRegister(REG_CONFIG, CONFIG_32V_320MV_12BIT_8S_CONTINUOUS)
        setCalibration(0.1, 2)
        initialized = true
    }

    /**
     * Set a custom calibration.
     * shuntOhms is the shunt resistor value in ohms.
     * maxCurrentA is the largest expected current in amps.
     */
    //% blockId=ina219_set_calibration block="INA219 set calibration shunt %shuntOhms ohm max current %maxCurrentA A"
    //% weight=85
    //% shuntOhms.defl=0.1
    //% maxCurrentA.defl=2
    export function setCalibration(shuntOhms: number, maxCurrentA: number): void {
        if (shuntOhms <= 0 || maxCurrentA <= 0) {
            return
        }

        // INA219 datasheet:
        //   Current_LSB ~= MaxExpectedCurrent / 32767
        //   Calibration = floor(0.04096 / (Current_LSB * Rshunt))
        // Power_LSB is always 20 * Current_LSB.
        currentLSB_A = maxCurrentA / 32767

        calibrationValue = Math.floor(0.04096 / (currentLSB_A * shuntOhms))
        if (calibrationValue < 1) calibrationValue = 1
        if (calibrationValue > 0xffff) calibrationValue = 0xffff

        // Recompute the actual LSB from the integer calibration we wrote.
        // This keeps current/power readings consistent with the shunt voltage.
        currentLSB_A = 0.04096 / (calibrationValue * shuntOhms)
        powerLSB_W = 20 * currentLSB_A

        applyCalibration()
    }

    /**
     * Read bus voltage in volts.
     */
    //% blockId=ina219_bus_voltage block="INA219 bus voltage (V)"
    //% weight=80
    export function busVoltage(): number {
        ensureInit()
        return (readRegisterU16(REG_BUS_VOLTAGE) >> 3) * 0.004
    }

    /**
     * Read shunt voltage in millivolts.
     */
    //% blockId=ina219_shunt_voltage block="INA219 shunt voltage (mV)"
    //% weight=75
    export function shuntVoltage(): number {
        ensureInit()
        return readRegisterS16(REG_SHUNT_VOLTAGE) * 0.01
    }

    /**
     * Read current in milliamps.
     */
    //% blockId=ina219_current block="INA219 current (mA)"
    //% weight=70
    export function current(): number {
        ensureInit()
        applyCalibration()
        const raw = readRegisterS16(REG_CURRENT)
        return raw * currentLSB_A * 1000
    }

    /**
     * Read power in milliwatts.
     */
    //% blockId=ina219_power block="INA219 power (mW)"
    //% weight=65
    export function power(): number {
        ensureInit()
        applyCalibration()
        const raw = readRegisterU16(REG_POWER)
        return raw * powerLSB_W * 1000
    }

    /**
     * Reset the INA219.
     */
    //% blockId=ina219_reset block="INA219 reset"
    //% weight=60
    export function reset(): void {
        writeRegister(REG_CONFIG, CONFIG_RESET)
        initialized = false
    }
}
