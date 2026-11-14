---
title: "[archive] a deep dive into swerve"
description: going down a rabbit hole with FIRST robotics programming
date: 2024-12-31
---

> [!info]
> nov 13, 2026: this is an old post on my older site that folks found helpful!  
> i figured i should preserve it here for reference.
>
> – sam

our FRC team recently bought some swerve modules — [MAXSwerve](https://www.revrobotics.com/rev-21-3005/), to be exact. after putting them together, i decided to dive into the code behind them. here's what i learned over a weekend (plus a few more nights). i've simplified what i originally shared with my team here.

### what’s this FRC thing?

i should probably explain this before we start. [FIRST robotics competition](https://www.firstinspires.org/robotics/frc) brings together teams of high school students to build large-scale robots and compete in challenges (and no, it's not like battle bots). working alongside adult mentors, we design, build, program, and test a brand new robot each year to tackle FIRST's annual challenge. for 2025, we know the theme revolves around the ocean, but we won't get the full details until january 4, when the season kicks off. here's what last year's game looked like:

[![watch on youtube](/writing/a-deep-dive-into-swerve/01.webp)](https://www.youtube.com/watch?v=9keeDyFxzY4)

[watch on youtube](https://www.youtube.com/watch?v=9keeDyFxzY4)

## moving the robot

a robot's drivetrain uses spinning wheels powered by motors to move around. while there are several types of drivetrains, i'll give a quick overview of a few before diving into our main focus: swerve drive.

### tank drive

tank drive is the most basic and most common drivetrain type. like a tank, it uses two sets of wheels — left and right — that control movement and rotation. the robot moves forward when both sets spin forward, and rotates when the sets spin in opposite directions.

tank drive is simple to build and program, but it has one key limitation: the robot can only move in the direction it's facing (forwards and backwards). this constraint becomes important when comparing it to other drivetrains.

![image credit: WPILib docs](/writing/a-deep-dive-into-swerve/02.webp)

image credit: [WPILib docs](https://docs.wpilib.org/en/stable/docs/software/hardware-apis/motors/wpi-drive-classes.html)

### mecanum drive

mecanum drive is uncommon in FRC. it uses special omnidirectional wheels that can move the robot forwards, backwards, sideways, and rotate. each wheel applies force at a 45-degree angle, and when multiple wheels spin together, their force vectors partially cancel each other out.

while mecanum drive offers an affordable way to achieve omnidirectional movement, it has drawbacks. the canceling forces reduce power, and the rollers on the wheels provide less friction than standard wheels.

![image credit: WPILib docs](/writing/a-deep-dive-into-swerve/03.webp)

image credit: [WPILib docs](https://docs.wpilib.org/en/stable/docs/software/hardware-apis/motors/wpi-drive-classes.html)

### swerve drive

swerve drive is the most common way to achieve omnidirectional movement. by physically rotating each wheel (like a shopping cart's caster wheels), the robot can drive and rotate in any direction.

while swerve drive is both expensive and the most complex to program, it offers unmatched speed and maneuverability.

![image credit: REV robotics](/writing/a-deep-dive-into-swerve/04.webp)

image credit: [REV robotics](https://www.revrobotics.com/rev-21-3005/)

a swerve chassis consists of four swerve modules (one is shown above). each module has two key functions: steering (changing the wheel's direction) and driving (spinning the wheel). two motors handle these functions—one for steering and one for driving—and an encoder tracks the wheel's direction.

> [!note]
> to the folks in FRC: yes, differential swerve exists, but it is no longer used due to recent rule changes.

## the math behind swerve

> [!source]
> team [2767 stryke force](https://www.strykeforce.org/) has an awesome slide deck on swerve drive. most things in this section is based off of theirs. they have a ton more detail into this. [link](https://strykeforce.github.io/classroom/swerve/#/swerve-drive-introduction)

in FIRST robotics, the coordinate system follows a standard convention: counterclockwise rotation is positive, and the z-axis points upward. here's how the axes appear when viewed from above:

![image credit: WPILib docs](/writing/a-deep-dive-into-swerve/05.webp)

image credit: [WPILib docs](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html)

a swerve robot has three degrees of motion:

- two translational: x and y
- one rotational: yaw (around the z axis)

since robots typically don’t fly, we ignore the z axis. we use θ (theta) to represent angular position and ω (omega) to represent angular velocity.

we can translate each of these degrees of motion into specific movements for each swerve wheel:

![image credit: stryke force](/writing/a-deep-dive-into-swerve/06.webp)

image credit: [stryke force](https://strykeforce.github.io/classroom/swerve/#/swerve-motion)

these velocity vectors illustrate the robot's movement. the purple arrows show the robot's overall direction and speed, while the red arrows indicate how each wheel moves individually.

just like regular vectors, we can combine these movement vectors. for example, if i want the robot to move forwards and to the right with equal speed:

![image credit: stryke force](/writing/a-deep-dive-into-swerve/07.webp)

image credit: [stryke force](https://strykeforce.github.io/classroom/swerve/#/swerve-motion)

this same principle applies to rotation. for example, if we want the robot to move forwards and right while rotating clockwise:

![image credit: stryke force](/writing/a-deep-dive-into-swerve/08.webp)

image credit: [stryke force](https://strykeforce.github.io/classroom/swerve/#/swerve-motion)

so what does all this mean in practice?

suppose i want the robot to move in a specific way (including rotation). we'll call this the target robot velocity vector. this target can be broken down into simpler velocity vectors. by calculating the wheel velocity vectors for each wheel and combining them, we can determine the final target wheel velocity vector for each wheel.

![image credit: modified upon original image from stryke force](/writing/a-deep-dive-into-swerve/09.svg)

image credit: modified upon original image from [stryke force](https://strykeforce.github.io/classroom/swerve/#/swerve-motion)

### some more considerations

the length of each velocity vector indicates speed, with a length of 1 representing 100% (max speed). after calculating the wheel vectors, their lengths can exceed 1. in the example above, all speeds except the bottom right are greater than 1, even though each individual wheel velocity vector has a length of 1.

a simple solution is to divide all speeds by the highest speed to normalize them. here's what that looks like with our example:

```
wheel         calculated speed  normalized speed
------------  ----------------  ----------------
top left      2.414             1.0
top right     1.732             0.717
bottom left   1.732             0.717
bottom right  0.414             0.172
```

the angle of the wheels can be optimized. rather than turning 180 degrees, simply reversing the wheel's spin direction achieves the same result. this means wheels never need to rotate more than 90 degrees.

in practice, the wheels take time to turn, causing a slight natural lag. to minimize this effect, the wheel speed can be multiplied by the cosine of the angle error. this cosine compensation technique effectively reduces directional skew during turns.

for example, when a wheel is perpendicular to its target direction: `cos(90°)=0`. the wheel stops spinning.

when the wheel points exactly where it should: `cos(0°)=1`. the speed remains unchanged.

### field oriented

right now, our target robot velocity vector is robot-relative. this means the robot moves relative to its own orientation—when you command it to go left, it moves left from wherever it's pointing.

but what if we want the robot to move relative to the field instead? with field-oriented drive, "forward" always means away from the driver, no matter which way the robot faces. this lets the robot rotate while moving in any direction—super fun! here's a cool video from team 1717 uncut demonstrating their field-oriented swerve drive:

[![watch on youtube](/writing/a-deep-dive-into-swerve/10.webp)](https://www.youtube.com/watch?v=kZHaTGiakZM)

[watch on youtube](https://www.youtube.com/watch?v=kZHaTGiakZM)

the theory behind field-oriented control is simpler than you might expect. a gyro added to the robot measures its angular offset. by offsetting all swerve modules in the opposite direction by the same amount, we effectively "cancel out" the robot's rotation.

however, there's a key detail: the rotational velocity vector should not be offset, since the robot's rotational velocity is always relative to itself and unaffected by field orientation.

when we convert robot velocity vectors into wheel velocity vectors, we simply need to rotate the x and y directional vectors—that's the main principle!

as mentioned earlier, swerve modules slightly lag behind their desired positions. during simultaneous movement and rotation, this lag causes the robot to travel in a slightly slanted path. a simple fix is to add or subtract a percentage of the angular velocity, deliberately programming a slanted line that results in straight motion.

## tools that i’ll be using

before diving into the code, let me introduce the key tools i'll be using. i'll explore most of these in more depth later. note that i won't cover [driver station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) (which connects to the robot and lets you control it) or [VS code and the WPILib API](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/vscode-basics.html) (used to interact with robot electronics).

### AdvantageScope

AdvantageScope comes pre-installed with WPILib and provides real-time visualization of robot telemetry data. its built-in tools offer far better insights than traditional console logs.

![image credit: AdvantageScope docs](/writing/a-deep-dive-into-swerve/11.webp)

image credit: [AdvantageScope docs](https://docs.advantagescope.org/)

### AdvantageKit

AdvantageKit is an optional logging framework that works seamlessly with AdvantageScope. it offers streamlined logging capabilities and enables data playback for simulation purposes.

### PathPlanner & PathPlannerLib

PathPlanner is a graphical interface for creating autonomous driving paths. its companion library, PathPlannerLib, handles all the necessary robot-side calculations.

### maple-sim

maple-sim is an FRC physics engine that simulates robots, subsystems, and projectiles. its standout feature is its ability to calculate collisions for both robots and game pieces, enabling highly accurate virtual testing.

### PhotonVision & PhotonLib

PhotonVision is a computer vision system for FRC that runs on a co-processor with PhotonLib. PhotonLib can simulate camera views, letting you test vision systems virtually.

## putting it together in code

> [!warning]
> this section assumes prior FRC programming knowledge and may be challenging to follow without it. the explanations here are meant to be read alongside the completed code — they focus on the reasoning behind implementation choices rather than providing step-by-step instructions. due to the complex nature of the content, a detailed tutorial format wasn't practical.
>
> if you're new to FRC programming, i strongly recommend starting with the [FRC 0 to autonomous](https://www.youtube.com/channel/UCmJAoN-yI6AJDv7JJ3372yg) series.

**all code is available in the various branches on GitHub:** [**link**](https://github.com/Earl-Of-March-FRC/2025-SwerveDev)

this code uses 2024 versions of all tools and libraries, unless noted otherwise.

### moving one module

let's start simple by controlling a single wheel. i'll make it follow the joystick position: pushing up points the wheel forward, down points it backward, and the further you push, the faster it spins. [**code for this section**](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/tree/one-wheel)

REV provides a handy `MAXSwerveModule` class that handles all the low-level motor control code. i won't delve into its details, but it's thoroughly documented.

[MAXSwerveModule.java](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/blob/one-wheel/src/main/java/frc/robot/subsystems/MAXSwerveModule.java)

the `MAXSwerveModule` class lets us control the swerve module by providing it with a `SwerveModuleState`. this state represents the wheel velocity vector mentioned earlier.

in our own `DriveTrainSubsystem` class, i expose this functionality while reducing the speed by 80% for safer testing.

```java
public void setSwerveState(SwerveModuleState state) {
  SwerveModuleState desiredState = new SwerveModuleState();
  desiredState.speedMetersPerSecond = state.speedMetersPerSecond * 0.2;
  desiredState.angle = desiredState.angle;
  m_swerveModule.setDesiredState(state);
}
```

i've also added methods like `resetEncoders` and `getState` to provide basic module control.

let's create a `SwerveDriveCmd` to expose this subsystem method and make it runnable. to prevent unwanted movement, we'll add logic that keeps the wheel from resetting to its zero position when it's not actively spinning.

```java
@Override
public void execute() {
  SwerveModuleState desiredState = new SwerveModuleState(velocityFunction.get(), rotationFunction.get());

  // Only change angle if it is moving
  if (desiredState.speedMetersPerSecond == 0) {
    desiredState.angle = driveSubsystem.getState().angle;
  }

  driveSubsystem.setSwerveState(desiredState);
}
```

this command can then be used in `RobotContainer` and bound to a controller.

```java
driveSubsystem.setDefaultCommand(
    new SwerveDriveCmd(
        driveSubsystem,
        () -> Math.sqrt(
          Math.pow(MathUtil.applyDeadband(controller.getRawAxis(OIConstants.kDriverControllerXAxis), OIConstants.kDriveDeadband), 2) +
          Math.pow(MathUtil.applyDeadband(controller.getRawAxis(OIConstants.kDriverControllerYAxis), OIConstants.kDriveDeadband), 2)
        ),
        () -> new Rotation2d(Math.atan2(
          MathUtil.applyDeadband(controller.getRawAxis(OIConstants.kDriverControllerXAxis), OIConstants.kDriveDeadband),
          MathUtil.applyDeadband(controller.getRawAxis(OIConstants.kDriverControllerYAxis), OIConstants.kDriveDeadband)
        ))
    )
);
```

and… that’s it! it should work now provided you’ve set up your swerve module correctly!

> [!note]
> note that this code structure isn't ideal - the joystick input conversion logic (the sqrt, atan, pow calculations) should really be in the subsystem or command class. i took a shortcut here.

### two (or more) modules

we can actually get a robot working with just two swerve modules (as long as we add a third point of support like a caster wheel). we're using only two modules (front left & back right) to minimize potential damage - these modules aren't cheap! [code for this section](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/blob/two-wheel-scratch/src/main/java/frc/robot/RobotContainer.java)

building on our previous work, we're now exposing two modules through `DriveTrainSubsystem`.

we'll implement all the math logic in `SwerveDriveCmd`. first, we create the "base vectors" that convert velocity vectors into wheel velocity vectors. since there's no straightforward way to represent a 2d vector, we're using `Translation2d` - it serves the same purpose.

```java
// base vectors (front left, back right)
Translation2d baseXVec[] = {new Translation2d(1, 0), new Translation2d(1, 0)};
Translation2d baseYVec[] = {new Translation2d(0, 1), new Translation2d(0, 1)};
Translation2d baseRotVec[] = {new Translation2d(-1, 1), new Translation2d(1, -1)};
```

we can then calculate the target wheel velocity vectors.

```java
Translation2d frontLeftVec = baseXVec[0].times(xVelFunction.get()).plus(baseYVec[0].times(yVelFunction.get())).plus(baseRotVec[0].times(rotVelFunction.get()));
Translation2d backRightVec = baseXVec[1].times(xVelFunction.get()).plus(baseYVec[1].times(yVelFunction.get())).plus(baseRotVec[1].times(rotVelFunction.get()));
```

we then calculate the magnitude and direction for our desired swerve module state.

```java
SwerveModuleState desiredStateFrontLeft = new SwerveModuleState(frontLeftVec.getNorm(), frontLeftVec.getAngle());
SwerveModuleState desiredStateBackRight = new SwerveModuleState(backRightVec.getNorm(), backRightVec.getAngle());
```

then, we can normalize the speeds to ensure everything is under 100%

```java
Double maxVel = Math.max(desiredStateFrontLeft.speedMetersPerSecond, desiredStateBackRight.speedMetersPerSecond);
if (maxVel > 1) {
  desiredStateFrontLeft.speedMetersPerSecond /= maxVel;
  desiredStateBackRight.speedMetersPerSecond /= maxVel;
}
```

we've been using percentages for speed since they make the math simpler, but the actual speed needs to be in meters per second. let's convert our percentage values to the proper units.

```java
desiredStateFrontLeft.speedMetersPerSecond *= DriveConstants.kMaxSpeedMetersPerSecond;
desiredStateBackRight.speedMetersPerSecond *= DriveConstants.kMaxSpeedMetersPerSecond;
```

when the robot stops moving and its speed drops to zero, the swerve module tries to reset to its default position of 0. to prevent this unwanted rotation, we keep the wheel at its last position when the speed is near zero by storing the previous angle in `prevAngle`.

```java
if (desiredStateFrontLeft.speedMetersPerSecond <= 0.05) {
  desiredStateFrontLeft.speedMetersPerSecond = 0;
  desiredStateFrontLeft.angle = prevAngle[0];
}
if (desiredStateBackRight.speedMetersPerSecond <= 0.05) {
  desiredStateBackRight.speedMetersPerSecond = 0;
  desiredStateBackRight.angle = prevAngle[1];
}
prevAngle[0] = desiredStateFrontLeft.angle;
prevAngle[1] = desiredStateBackRight.angle;
```

yes, i forgot to add cosine compensation. it’ll be in the next part.

now we need to feed the controller inputs into the command in `RobotContainer`. note that the x and y directions are flipped and negated due to different axis conventions between the controller and robot.

```java
driveSubsystem.setDefaultCommand(
  new SwerveDriveCmd(
      driveSubsystem,
      () -> MathUtil.applyDeadband(-controller.getRawAxis(OIConstants.kDriverControllerYAxis), OIConstants.kDriveDeadband),
      () -> MathUtil.applyDeadband(-controller.getRawAxis(OIConstants.kDriverControllerXAxis), OIConstants.kDriveDeadband),
      () -> MathUtil.applyDeadband(-controller.getRawAxis(OIConstants.kDriverControllerRotAxis), OIConstants.kDriveDeadband)
  )
);
```

that’s it!

### two (or more) modules — the IO interface

[**code for this section**](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/tree/advantagekit-two-wheel)

#### IO interface

let's explore IO interfaces, which use a significantly different code structure.

let's look at how code traditionally runs on a robot:

![image](/writing/a-deep-dive-into-swerve/12.webp)

data flows into the "robot logic", gets processed, and outputs emerge at various points in the code. though this linear structure seems straightforward, it complicates monitoring and logging the system's state. there's also a risk that sensor data may be unavailable when needed (for example, if vision processing hasn't completed), forcing you to manually track and store past data.

here's how we can structure code using an IO interface:

![image](/writing/a-deep-dive-into-swerve/13.webp)

"does this really need to be _this_ complicated?" don't worry—it'll make more sense once we start coding.

essentially, we abstract everything flowing into and out of the subsystem logic into one central place: the IO class. this structure enforces accurate logging, since inputs remain unmodified until they're logged, and outputs are converted into a common format for logging before being translated into hardware-specific values.

since it's an interface implementation, we can swap out the IO class while preserving everything else, and the code will continue working. this is a _huge_ advantage—it lets us easily switch between code for real hardware and simulated hardware.

> [!question]
> clarification on inputs & outputs:
>
> - inputs: everything that flows into the robot logic, including encoder values, limit switches, and vision data
> - outputs: everything that the robot logic sends to the hardware, such as target positions and voltages
>
> since inputs remain unprocessed, their logging stays free from any potential code errors.

but why have a hardware class? why not let the subsystem call methods directly on the IO class? while this is possible, the IO class should _only_ handle hardware-specific code (like for spark or talon motor controllers). the subsystem should output data in an easily loggable format (such as a `Pose2d` rather than raw encoder values). putting calculations in the hardware class lets us reuse common operations. a subsystem might need multiple instances of the hardware class (swerve drive need multiple modules). this pattern isn't always necessary though—a simple device like a gyro might not need a hardware class since it has minimal methods beyond calibration.

#### back to the code

let's define the IO interface for the swerve module, `ModuleIO`. the interface defines inputs that other code can read through an `updateInputs` method, and setters for hardware control. we'll keep it hardware-agnostic by excluding any device-specific code.

```java
public interface ModuleIO {
    @AutoLog
    public static class ModuleIOInputs {
        public SwerveModulePosition position = new SwerveModulePosition();
        public SwerveModuleState state = new SwerveModuleState();
    }

    public default void updateInputs(ModuleIOInputs inputs) {}

    public default void setState(SwerveModuleState state) {}
    public default void resetEncoders() {}
}
```

note that i added the `@AutoLog` annotation, which allows AdvantageKit to automatically log all values in the inputs.

next, let's implement the hardware-specific version of this interface: the IO class, `ModuleIOMAXSwerve`. since this class contains only MAXSwerve-specific code and is quite lengthy, i'll link to it rather than include it here.

[ModuleIOMAXSwerve.java](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/blob/advantagekit-two-wheel/src/main/java/frc/robot/subsystems/drivetrain/ModuleIOMAXSwerve.java)

note that parameters are allowed in the constructor. also, the `setState` method tells the module to move.

we now create the hardware class, `Module`, which contains most of the common code. the constructor takes an instance of `ModuleIO`, and the class's `periodic` function updates and logs its inputs. by using `ModuleIO` instead of `ModuleIOMAXSwerve` and leveraging interfaces, we can easily support different module implementations.

```java
public Module(ModuleIO io, int index) {
    this.io = io;
    this.index = index;
}

public SwerveModuleState runState(SwerveModuleState state) {
    // the code here is similar to what was done before in MAXSwerveModule.java's setDesiredState
    io.setState(optimizedDesiredState);
    return optimizedDesiredState;
}

public void periodic() {
    io.updateInputs(inputs);
    Logger.processInputs("Drive/Module" + Integer.toString(index), inputs);
}

// more code ...
```

the logger automatically logs inputs under `Drive/Module0`, `Drive/Module1`, etc.

since this isn't a subsystem, the periodic function isn't an override. instead, it's called by the subsystem's periodic method.

i'll skip the details of the gyro implementation. since the gyro is straightforward, i omitted its hardware class. you can find the code in [the repository](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/tree/advantagekit-two-wheel).

the `Drivetrain` subsystem will take in `ModuleIO` and create the hardware classes internally. since the gyro has no hardware class, we simply store its IO.

```java
public Drivetrain(ModuleIO flModuleIO, ModuleIO brModuleIO, GyroIO gyroIO) {
  modules[0] = new Module(flModuleIO, 0);
  modules[1] = new Module(brModuleIO, 3);
  this.gyroIO = gyroIO;
}
```

since the gyro lacks a hardware class, we must handle its input updates and logging within the subsystem

```java
@Override
public void periodic() {
  gyroIO.updateInputs(gyroInputs);
  Logger.processInputs("Drive/Gyro", gyroInputs);
  // more code...
```

to implement field-oriented control, we subtract the gyro's measured angle from the translational vectors in the module class to negate the robot's rotation. after this adjustment, we add the rotation vector back to maintain the desired turning motion.

```java
Translation2d frontLeftVec = baseXVec[0].times(speeds.vxMetersPerSecond)
    .plus(baseYVec[0].times(speeds.vyMetersPerSecond)).rotateBy(gyroInputs.angle.times(-1));
frontLeftVec = frontLeftVec.plus(baseRotVec[0].times(speeds.omegaRadiansPerSecond));
Translation2d backRightVec = baseXVec[1].times(speeds.vxMetersPerSecond)
    .plus(baseYVec[1].times(speeds.vyMetersPerSecond)).rotateBy(gyroInputs.angle.times(-1));
backRightVec = backRightVec.plus(baseRotVec[1].times(speeds.omegaRadiansPerSecond));
```

the computation follows the same pattern as before, but now we invoke the `runState` method from the `Module` class.

```java
for (int i = 0; i < desiredStates.length; i++) {
  modules[i].runState(state);
}
```

we can record these states for debugging. since i'm only using two modules, i've added two empty states to fill out the array.

```java
Logger.recordOutput("SwerveStates/Setpoints", new SwerveModuleState[] { desiredStates[0], new SwerveModuleState(),
    new SwerveModuleState(), desiredStates[1] });
```

now let's update our `SwerveDriveCmd` to match this new structure. the command won't perform any calculations, but simply pass values through.

```java
public SwerveDriveCmd(Drivetrain dSub, Supplier<Double> xSup, Supplier<Double> ySup, Supplier<Double> wSup) {
  driveSub = dSub;
  xSupplier = xSup;
  ySupplier = ySup;
  omegaSupplier = wSup;

  addRequirements(driveSub);
}

@Override
public void execute() {
  driveSub.runVelocity(new ChassisSpeeds(xSupplier.get(), ySupplier.get(), omegaSupplier.get()));
}
```

`RobotContainer` needs updating as well. we'll provide the IO classes as inputs to the subsystem constructor.

```java
driveSub = new Drivetrain(
    new ModuleIOMAXSwerve(0),
    new ModuleIOMAXSwerve(3),
    new GyroIOADXRS450());

driveSub.setDefaultCommand(
  new SwerveDriveCmd(
      driveSub,
      () -> MathUtil.applyDeadband(-controller.getRawAxis(OIConstants.kDriverControllerYAxis),
          OIConstants.kDriveDeadband),
      () -> MathUtil.applyDeadband(-controller.getRawAxis(OIConstants.kDriverControllerXAxis),
          OIConstants.kDriveDeadband),
      () -> MathUtil.applyDeadband(-controller.getRawAxis(OIConstants.kDriverControllerRotAxis),
          OIConstants.kDriveDeadband)));
```

that wraps this section! you can view all the logged values in AdvantageScope's swerve tab by dragging them from the left panel. i've included the controller view as well. to connect to the robot, just check the file tab.

![image](/writing/a-deep-dive-into-swerve/14.webp)

![video](/writing/a-deep-dive-into-swerve/15.mp4)

## simulation & path following

here comes the exciting part — simulating all of this so we don’t need a real robot! [**code for this section**](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/blob/simulation/src/main/java/frc/robot/subsystems/drivetrain/Drivetrain.java)

### simplifying our code

instead of performing the swerve drive calculations manually, we can use WPILib's built-in [kinematics utilities](https://docs.wpilib.org/en/stable/docs/software/kinematics-and-odometry/intro-and-chassis-speeds.html) to handle the math for us. i'll also upgrade from two modules to four, since that's what we'll use in competition.

the modules themselves remain unchanged, but we need to modify how we generate each swerve module's `SwerveModuleState` in the `Drivetrain` subsystem.

first, we need to define our drivetrain's kinematics in our constants file.

```java
public static final SwerveDriveKinematics kDriveKinematics = new SwerveDriveKinematics(
    new Translation2d(kWheelBase / 2, kTrackWidth / 2),
    new Translation2d(kWheelBase / 2, -kTrackWidth / 2),
    new Translation2d(-kWheelBase / 2, kTrackWidth / 2),
    new Translation2d(-kWheelBase / 2, -kTrackWidth / 2));
```

in our `runVelocity` function, we can now simplify all our previous vector math into a single line of code.

```java
SwerveModuleState[] states = DriveConstants.kDriveKinematics.toSwerveModuleStates(fieldOrientedSpeeds);
```

we still need to normalize these values to prevent them from exceeding the maximum speed. note that we're now working with actual speeds in meters per second rather than percentages.

```java
SwerveDriveKinematics.desaturateWheelSpeeds(states, DriveConstants.kMaxSpeedMetersPerSecond);
```

i've now implemented cosine compensation in our `Module` class, which i had missed in the previous iteration.

```java
correctedDesiredState.speedMetersPerSecond *= correctedDesiredState.angle.minus(getAngle()).getCos();
```

field-oriented driving is straightforward to implement. i've added a boolean toggle to switch between field-oriented and robot-oriented driving.

another important consideration: when modules rotate to new positions, they create a "skew" effect in field-oriented driving. to counteract this, we apply an opposite skew to the path. the faster the robot rotates, the more skew compensation is needed.

```java
Rotation2d compensatedAngle = gyroInputs.angle.plus(new Rotation2d(gyroInputs.rate*0.05));
ChassisSpeeds fieldOrientedSpeeds = fieldRelative ? ChassisSpeeds.fromFieldRelativeSpeeds(
  speeds.vxMetersPerSecond, speeds.vyMetersPerSecond, speeds.omegaRadiansPerSecond, compensatedAngle
) : speeds;
```

for the command class, we now accept a `ChassisSpeed` parameter instead of individual velocities. we'll handle the conversion in `SwerveDriveCmd`.

```java
@Override
public void execute() {
  Double xVel = xSupplier.get()*DriveConstants.kMaxSpeedMetersPerSecond;
  Double yVel = ySupplier.get()*DriveConstants.kMaxSpeedMetersPerSecond;
  Double omega = omegaSupplier.get()*DriveConstants.kMaxAngularSpeed;
  Logger.recordOutput("Drive/Inputs/xVel", xVel);
  Logger.recordOutput("Drive/Inputs/yVel", yVel);
  Logger.recordOutput("Drive/Inputs/omega", omega);

  driveSub.runVelocity(new ChassisSpeeds(xVel, yVel, omega));
}
```

and everything should work the same as before!

### simulating components

the IO interface structure makes it super easy for us swap parts for simulated stuff. let’s start with the swerve module.

we'll create a `ModuleIOSim` class that implements `ModuleIO`. this will closely mirror `ModuleIOMAXSwerve`.

for motor simulation, WPILib provides a `DCMotorSim` class. while the simulation isn't perfect and uses somewhat arbitrary constants, it gets the job done. you could calculate more precise values, but i didn't have a physical robot available for measurements.

```java
private final DCMotorSim driveSim = new DCMotorSim(DCMotor.getNEO(1), ModuleConstants.kDrivingMotorReduction, 0.025);
private final DCMotorSim turnSim = new DCMotorSim(DCMotor.getNeo550(1), ModuleConstants.kTurningMotorReduction, 0.004);
```

in a real robot, the [spark MAX](https://www.revrobotics.com/rev-11-2158/) motor controller handles [PID](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/introduction-to-pid.html#introduction-to-pid) control automatically, but we'll need to implement this ourselves for the simulation.

> [!question]
> **PID:** we can't just tell a motor to go to a specific position—we need to control its direction and voltage based on where it is and where it needs to go. simply commanding a motor to turn until it reaches a target will cause it to overshoot. PID control allows motors to move smoothly to their target positions. since every motor behaves differently, PID settings must be tuned for each one.

```java
drivePID = new PIDController(ModuleConstants.kDrivingPSim.get(), ModuleConstants.kDrivingISim.get(), ModuleConstants.kDrivingDSim.get());
driveFeedforward = new SimpleMotorFeedforward(0.0, 0.1);
turnController = new PIDController(ModuleConstants.kTurningPSim.get(), ModuleConstants.kTurningISim.get(), ModuleConstants.kTurningDSim.get());
turnController.enableContinuousInput(-Math.PI, Math.PI);
```

feedforward provides an initial "push" to help get the system moving. the `continuousInput` tells the controller that values wrap around—meaning `2π` represents the same position as 0.

the simulation logic runs in the `updateInputs` method since it executes periodically. we must still update the input values during each cycle.

```java
@Override
  public void updateInputs(ModuleIOInputs inputs) {
      drivePID.setP(ModuleConstants.kDrivingPSim.get());
      drivePID.setI(ModuleConstants.kDrivingISim.get());
      drivePID.setD(ModuleConstants.kDrivingDSim.get());
      turnController.setP(ModuleConstants.kTurningPSim.get());
      turnController.setI(ModuleConstants.kTurningISim.get());
      turnController.setD(ModuleConstants.kTurningDSim.get());

      driveSim.update(LOOP_PERIOD_SECS);
      turnSim.update(LOOP_PERIOD_SECS);

      inputs.position = new SwerveModulePosition(
          driveSim.getAngularPositionRad() * ModuleConstants.kWheelDiameterMeters / 2,
          new Rotation2d(turnSim.getAngularPositionRad())
      );
      inputs.state = new SwerveModuleState(
          driveSim.getAngularVelocityRadPerSec() * ModuleConstants.kWheelDiameterMeters / 2,
          new Rotation2d(turnSim.getAngularPositionRad())
      );
  }
```

note that i'm using `getAngularPositionRad` and `getAngularVelocityRadPerSec` to obtain the simulated values. the simulation includes some built-in delay and other realistic effects.

since the simulated motors accept voltage inputs, we'll use the PID controllers' output along with conversion factors to account for the gearing ratios and wheel diameter.

```java
@Override
public void setState(SwerveModuleState state) {
    driveSim.setInputVoltage(driveFeedforward.calculate(state.speedMetersPerSecond / (ModuleConstants.kWheelDiameterMeters / 2)) + drivePID.calculate(driveSim.getAngularVelocityRadPerSec(), state.speedMetersPerSecond / (ModuleConstants.kWheelDiameterMeters / 2)));
    turnSim.setInputVoltage(turnController.calculate(turnSim.getAngularPositionRad(), state.angle.getRadians()));
}
```

we need to log the measured states from each module. these values should show a slight delay compared to the setpoints, since motors take time to reach their target positions. while this is technically a getter method, the `@AutoLogOutput` annotation will handle automatically logging the returned values.

```java
@AutoLogOutput(key = "SwerveStates/Measured")
public SwerveModuleState[] getModuleStates() {
  return new SwerveModuleState[] {
      modules[0].getState(),
      modules[1].getState(),
      modules[2].getState(),
      modules[3].getState()
  };
}
```

let's simulate the gyro next. the `GyroIOSim` class will implement the `GyroIO` interface, similar to how `GyroIOADRS450` works.

```java
public class GyroIOSim implements GyroIO {
    private static final double LOOP_PERIOD_SECS = 0.02;

    private Double angle = 0.0;
    private Double rate = 0.0;

    public GyroIOSim() {
    }

    @Override
    public void updateInputs(GyroIOInputs inputs) {
        angle += rate * LOOP_PERIOD_SECS;

        inputs.connected = true;
        inputs.angle = new Rotation2d(angle);
        inputs.rate = rate;
    }

    @Override
    public void calibrate() {
        rate = 0.0;
        angle = 0.0;
    }

    public void updateAngularVelocity(double angularVelocity) {
        rate = angularVelocity;
    }

    public void updateAngle(double angle) {
        this.angle = angle;
    }
}
```

gyros measure angular velocity, so let's implement that in our simulation. since we don't have actual velocity measurements to work from, i'll create a method that allows us to set this value manually.

```java
private Double rate = 0.0;

public void updateAngularVelocity(double angularVelocity) {
    rate = angularVelocity;
}
```

we know `updateInputs` runs periodically, so we can incrementally update our angle position. by default, the robot code loops every 0.02 seconds.

```java
private static final double LOOP_PERIOD_SECS = 0.02;
private Double angle = 0.0;

@Override
public void updateInputs(GyroIOInputs inputs) {
    angle += rate * LOOP_PERIOD_SECS;

    inputs.connected = true;
    inputs.angle = new Rotation2d(angle);
    inputs.rate = rate;
}
```

next are methods to calibrate and directly set the gyro's angle.

```java
@Override
public void calibrate() {
    rate = 0.0;
    angle = 0.0;
}

public void updateAngle(double angle) {
    this.angle = angle;
}
```

that's it for `GyroIOSim`, but we still need to provide it with angular velocity data. without actual sensor readings, we'll need to get creative. we can use kinematics to estimate the chassis's velocity vectors and extract the rotational component. this isn't a perfect solution since it assumes the robot's estimated position perfectly matches reality—which never happens in practice.

back in the `Drivetrain` subsystem, let's create a helper function to calculate the `ChassisSpeeds`. since the module states are robot-relative, this calculation will give us robot-relative speeds.

```java
public ChassisSpeeds getRelativeChassisSpeeds() {
  return DriveConstants.kDriveKinematics.toChassisSpeeds(
    modules[0].getState(), modules[1].getState(), modules[2].getState(), modules[3].getState()
  );
}
```

we can then use this calculated value to update our simulated gyro

```java
ChassisSpeeds measuredChassisSpeeds = getRelativeChassisSpeeds();
// Simulation only
if (gyroIO instanceof GyroIOSim) {
  ((GyroIOSim) gyroIO).updateAngularVelocity(measuredChassisSpeeds.omegaRadiansPerSecond);
}
```

since the IO interface supports multiple gyro implementations, we need to verify that we're working with the simulated version.

### using simulated components

thanks to the IO interface, implementation is straightforward. a simple if statement in `RobotContainer` lets us switch between simulated and real components.

```java
if (RobotBase.isReal()) {
  gyroIO = new GyroIOADXRS450();
  driveSub = new Drivetrain(
      new ModuleIOMAXSwerve(0),
      new ModuleIOMAXSwerve(1),
      new ModuleIOMAXSwerve(2),
      new ModuleIOMAXSwerve(3),
      gyroIO);
} else {
  gyroIO = new GyroIOSim();
  driveSub = new Drivetrain(
      new ModuleIOSim(),
      new ModuleIOSim(),
      new ModuleIOSim(),
      new ModuleIOSim(),
      gyroIO);
}
```

when running the simulation in AdvantageScope, you can see the lag between the target states and the actual measured states.

![video](/writing/a-deep-dive-into-swerve/16.mp4)

### odometry

odometry is a method of pose estimation that tracks where the robot is based on sensor data. by measuring how far and in which direction the wheels have moved, we can calculate the robot's pose relative to its starting point. a pose describes both the robot's position (translation) and orientation (rotation) in space. we can use odometry as a starting point to visualize the robot's pose in an idealized environment.

this isn’t perfect, wheel slippage causes the position estimate to become increasingly inaccurate over time.

WPILib makes odometry really easy. let's modify some code in our `Drivetrain` subsystem.

```java
SwerveDriveOdometry odometry = new SwerveDriveOdometry(
  DriveConstants.kDriveKinematics,
  new Rotation2d(),
  new SwerveModulePosition[] {
    new SwerveModulePosition(),
    new SwerveModulePosition(),
    new SwerveModulePosition(),
    new SwerveModulePosition()
  }
);
```

`SwerveModulePosition` is similar to `SwerveModuleState`, but instead of tracking velocity, it measures the distance the wheel has traveled. odometry uses these wheel displacement measurements to estimate the robot's position.

to track the robot's position, we must continuously update the odometry calculations using the latest module positions and gyro angle readings

```java
@Override
public void periodic() {
  // other code ...

  Pose2d pose = odometry.update(
    gyroInputs.angle,
    getModulePositions()
  );

  // other code...
}

public SwerveModulePosition[] getModulePositions() {
  return new SwerveModulePosition[] {
      modules[0].getPosition(),
      modules[1].getPosition(),
      modules[2].getPosition(),
      modules[3].getPosition()
  };
}
```

we can use AdvantageScope's auto-logging feature to track the robot's estimated pose

```java
@AutoLogOutput(key = "Drive/Odometry")
public Pose2d getPose() {
  return odometry.getPoseMeters();
}
```

AdvantageScope lets you visualize this pose in either 2d or 3d field view. while the 3d view looks more impressive, it does require more computational power.

![video](/writing/a-deep-dive-into-swerve/17.mp4)

notice how the robot passes through objects. this happens because the robot only tracks its estimated coordinates without any awareness of the physical field or obstacles around it. at this stage, there's no physics simulation involved.

### path following

being able to track the robot's position in space unlocks powerful capabilities. we can command the robot to move to specific coordinates or follow a sequence of waypoints—this is the essence of path/trajectory following.

> [!note]
> in practice, odometry is rarely perfect and tends to drift over time. this can be corrected using vision systems (which i'll cover later).

for path following, i'll be using [PathPlanner](https://pathplanner.dev/home.html), a tool that offers powerful features for creating and following robot paths.

> [!info]
> i'll skip explaining the GUI since it's quite straightforward. check out [their docs](https://pathplanner.dev/gui-getting-started.html) for a walkthrough.

first, we need to set up an `AutoBuilder` in the constructor of the `Drivetrain` subsystem. this will handle all the complex calculations for us.

```java
AutoBuilder.configureHolonomic(
  this::getPose,
  this::resetOdometry,
  this::getRelativeChassisSpeeds,
  this::runVelocityRobotRelative,
  new HolonomicPathFollowerConfig(
    new PIDConstants(AutoConstants.kPXController, AutoConstants.kIXController, AutoConstants.kDXController),
    new PIDConstants(AutoConstants.kPThetaController, AutoConstants.kIThetaController, AutoConstants.kDThetaController),
    AutoConstants.kMaxModuleSpeedMetersPerSecond,
    DriveConstants.kDriveRadius,
    new ReplanningConfig()
  ),
  () -> {
    Optional<Alliance> alliance = DriverStation.getAlliance();
    return alliance.isPresent() ? alliance.get() == DriverStation.Alliance.Red : false;
  },
  this
);
```

holonomic refers to omnidirectional drives like swerve. PathPlanner needs to know which alliance side the robot is on since some fields are asymmetrical. regardless of alliance color, the field's coordinate origin remains in the same position relative to each alliance's driver station.

let's create a command that drives the robot autonomously to the speaker. we'll call it `GoToSpeakerCmd`.

```java
public class GoToSpeakerCCmd extends SequentialCommandGroup {

  public GoToSpeakerCCmd() {
    PathPlannerPath intoSpeakerCPath = PathPlannerPath.fromPathFile("Into Speaker Center");
    PathConstraints pathfindingConstraints = new PathConstraints(
      AutoConstants.kMaxSpeedMetersPerSecond, AutoConstants.kMaxAccelerationMetersPerSecondSquared,
      AutoConstants.kMaxAngularSpeedRadiansPerSecond, AutoConstants.kMaxAngularSpeedRadiansPerSecondSquared
    );

    addCommands(
      AutoBuilder.pathfindThenFollowPath(intoSpeakerCPath, pathfindingConstraints)
    );
  }
}
```

we configure PathPlanner with our robot's physical constraints like maximum speed and acceleration. the software first pathfinds to reach the starting point of the "into speaker center" path, avoiding obstacles along the way. then it follows that predefined path precisely. using a fixed final approach path makes the robot's movement more consistent and accurate.

we can bind this command to a button in `RobotContainer` to make it run while it's held. this while-held approach is safer than a simple start/stop button.

```java
new JoystickButton(controller, 3).whileTrue(
  new GoToSpeakerCCmd()
);
```

i created similar paths for the amp and human player station. here's how they look together in AdvantageScope.

![video](/writing/a-deep-dive-into-swerve/18.mp4)

driving in the autonomous period works similarly. simply create an auto chooser in `RobotContainer` and return PathPlanner's generated autonomous command.

```java
public RobotContainer() {
  // more code...

  autoChooser = new LoggedDashboardChooser<Command>("Auto Routine", AutoBuilder.buildAutoChooser());
  SmartDashboard.putData("Auto Routine", autoChooser.getSendableChooser());

  // more code...
}

public Command getAutonomousCommand() {
  return autoChooser.get();
}
```

here's a demonstration of an autonomous routine that still requires tuning

![video](/writing/a-deep-dive-into-swerve/18.mp4)

## physics & vision

> [!info]
> from this point forward, we'll use the 2025 versions of all libraries. [maple-sim](https://shenzhen-robotics-alliance.github.io/maple-sim/) has significantly enhanced its swerve simulation capabilities in the 2025 release.
>
> i'll skip explaining the code migration process to the 2025 version, as each package's documentation provides comprehensive upgrade guides.

[**code for this section**](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/blob/maple-sim/src/main/java/frc/robot/RobotContainer.java)

### physics with maple-sim

so far, our simulation hasn't included any actual physics, which limits its accuracy. [maple-sim](https://shenzhen-robotics-alliance.github.io/maple-sim/) fills this gap by approximating real-world physics for robot subsystems. it can simulate field and game piece collisions, wheel skidding, gyro drift, and more. while maple-sim doesn't have its own interface, it integrates with AdvantageScope for visualization.

to get started, let's create a simulated field. we'll use maple-sim in [robot](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/blob/maple-sim/src/main/java/frc/robot/Robot.java) to set up our virtual arena. we'll need to track game piece positions so they can be displayed in AdvantageScope

```java
@Override
public void simulationPeriodic() {
  SimulatedArena.getInstance().simulationPeriodic();

  List<Pose3d> physNotePositionsList = SimulatedArena.getInstance().getGamePiecesByType("Note");
  Pose3d[] physNotePositions = physNotePositionsList.toArray(new Pose3d[physNotePositionsList.size()]);
  Logger.recordOutput("FieldSimulation/NotePositions", physNotePositions);
}
```

let's update our `ModuleIOSim` to integrate with maple-sim. we'll use maple-sim's `SwerveModuleSimulation` and `SimulatedMotorController` classes. the changes are minimal, mainly involving the new unit system introduced in 2025. the only structural change is that the constructor now requires a `SwerveModuleSimulation` parameter.

[ModuleIOSim.java](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/blob/maple-sim/src/main/java/frc/robot/subsystems/drivetrain/ModuleIOSim.java)

the `GyroIOSim` implementation will be different from before. by using maple-sim's `GyroSimulation`, we can simulate realistic gyro drift. this new approach is more straightforward than our previous implementation. like the module simulation, the constructor requires a `GyroSimulation` parameter.

```java
public class GyroIOSim implements GyroIO {
    private final GyroSimulation gyroSimulation;

    public GyroIOSim(GyroSimulation gyroSim) {
        this.gyroSimulation = gyroSim;
    }

    @Override
    public void updateInputs(GyroIOInputs inputs) {
        inputs.connected = true;
        inputs.angle = gyroSimulation.getGyroReading();
        inputs.rate = gyroSimulation.getMeasuredAngularVelocity().in(Units.RadiansPerSecond);
    }

    @Override
    public void calibrate() {
        gyroSimulation.setRotation(new Rotation2d(0));
    }
}
```

in our drivetrain subsystem, we create an overloaded constructor that accepts an optional `SwerveDriveSimulation` parameter. for safety, we add a check to prevent the simulation from running on a physical robot since it would unnecessarily consume resources.

```java
public Drivetrain(ModuleIO flModuleIO, ModuleIO frModuleIO, ModuleIO blModuleIO, ModuleIO brModuleIO, GyroIO gyroIO, ATVisionIO visionIO, SwerveDriveSimulation DriveSim) {
  this(flModuleIO, frModuleIO, blModuleIO, brModuleIO, gyroIO, visionIO);
  if (Robot.isReal()) throw new RuntimeException("Do not run simulation on the real robot!");
  this.driveSimulation = DriveSim;
}
```

we use this to log the actual robot position so we can view it in AdvantageScope. this value differs from odometry (where the robot thinks it is). the real position is never revealed to the robot's logic.

```java
if (Robot.isSimulation()) {
  Logger.recordOutput("FieldSimulation/RobotPosition", driveSimulation.getSimulatedDriveTrainPose());
}
```

back in `RobotContainer`, we need to set up the drivetrain simulation and add it to our virtual field before passing it to the `Drivetrain` subsystem. this configuration requires several physical constants to be defined.

```java
 DriveTrainSimulationConfig driveTrainSimulationConfig = DriveTrainSimulationConfig.Default()
    .withGyro(COTS.ofGenericGyro())
    .withSwerveModule(COTS.ofMAXSwerve(
      DCMotor.getNEO(1),
      DCMotor.getNeo550(1),
      COTS.WHEELS.COLSONS.cof,
      2))
    .withTrackLengthTrackWidth(
      Units.Meters.of(DriveConstants.kWheelBase),
      Units.Meters.of(DriveConstants.kTrackWidth)
    )
    .withBumperSize(Units.Meters.of(0.75), Units.Meters.of(0.75));
SwerveDriveSimulation swerveDriveSimulation = new SwerveDriveSimulation(
  driveTrainSimulationConfig,
  new Pose2d(2, 2, new Rotation2d(0))
);

gyroIO = new GyroIOSim(swerveDriveSimulation.getGyroSimulation());

driveSub = new Drivetrain(
    new ModuleIOSim(swerveDriveSimulation.getModules()[0]),
    new ModuleIOSim(swerveDriveSimulation.getModules()[1]),
    new ModuleIOSim(swerveDriveSimulation.getModules()[2]),
    new ModuleIOSim(swerveDriveSimulation.getModules()[3]),
    gyroIO,
    swerveDriveSimulation
);

SimulatedArena.getInstance().addDriveTrainSimulation(swerveDriveSimulation);
```

the physics simulation, including collisions, is now functional! the odometry data (in green) becomes increasingly inaccurate over time and loses precision during collisions. this happens because the robot's position estimates—based on gyro angles and wheel movements—lack awareness of the actual field environment and have inherent limitations in accuracy.

![video](/writing/a-deep-dive-into-swerve/20.mp4)

### vision with PhotonVision

so far, all our sensor data has been relative to the starting point. as the robot moves, errors in these relative measurements add up, making its position estimate increasingly inaccurate. to fix these errors, we need to know the robot's absolute position. this is where vision comes in - the robot can see AprilTags and calculate its position relative to them. since we know the absolute positions of these tags on the field, we can determine the robot's absolute position.

> [!question]
> why don't we just use vision and forget about encoders entirely?
>
> even with multiple cameras on your robot, there will be times when no AprilTags are visible. regular odometry helps estimate the robot's position between AprilTag sightings. in practice, recognizing AprilTags is challenging, particularly when the robot moves at high speeds.

like our other subsystems, we'll implement vision using the IO structure. first, let's create an IO interface, `ATVisionIO`.

```java
public interface ATVisionIO {
    @AutoLog
    public static class ATVisionIOInputs {
        public boolean[] connected;
        public double latencySeconds;
        public int targetsCount;
        public int[] targetIDs;
        public Transform3d[] cameraToTargets;
        public Pose3d[] robotPoses;
        public double[] timestamp;
    }

    public default void updateInputs(ATVisionIOInputs inputs) {
    }

    public default void setReferencePose(Pose2d prevEstimatedPose) {
    }
}
```

next, we'll create a hardware class to handle the implementation. it processes the `robotPoses` from the inputs by calculating the average of all valid poses along with their average timestamp.

[ATVision.java](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/blob/maple-sim/src/main/java/frc/robot/subsystems/vision/ATVision.java)

we can then implement the simulated vision IO class. we use PhotonLib's `PhotonCameraSim` to simulate a virtual camera view. the implementation is complex due to the nested data structures.

in `updateInputs`, we detect AprilTags and calculate an estimated pose based on their positions. we then store this pose and related metadata in `inputs`.

[ATVisionIOSim.java](https://github.com/Earl-Of-March-FRC/2025-SwerveDev/blob/maple-sim/src/main/java/frc/robot/subsystems/vision/ATVisionIOSim.java)

the vision simulation needs to know the robot's true position to simulate camera views. we can't use odometry data since that's what we're trying to correct with vision. this is where maple-sim helps by providing the robot's "real" position. we only use this real position to generate simulated camera views—not to estimate the robot's pose, as that would defeat the purpose. on a physical robot, we won't need maple-sim's position data since we'll have actual camera feeds from the hardware.

```java
public ATVisionIOSim(
      List<Pair<String, SimCameraProperties>> cameraProperties,
      List<Transform3d> robotToCamera,
      AprilTagFieldLayout aprilTagFieldLayout,
      Supplier<Pose2d> trueRobotPoseSupplier) {
  // more code...

  trueRobotPoseSup = trueRobotPoseSupplier;
}

@Override
public void updateInputs(ATVisionIOInputs inputs) {
    visionSystemSim.update(trueRobotPoseSup.get());
    // more code...
```

> [!note]
> PhotonVision's vision simulation is too accurate and doesn't account for visual obstructions. in real life, cameras have noise and distortion. while these factors can be corrected for, the results are not perfect.

finally, we need to incorporate our vision estimates into the robot's positioning system. instead of using plain odometry, we'll use `SwerveDrivePoseEstimator`. this is a drop-in replacement for odometry that adds vision support. to implement this, we need to update the constructor in our `Drivetrain` subsystem by adding an `ATVisionIO` parameter and creating an `ATVision` hardware class, similar to how we set up the swerve modules.

```java
public Drivetrain(ModuleIO flModuleIO, ModuleIO frModuleIO, ModuleIO blModuleIO, ModuleIO brModuleIO, GyroIO gyroIO, ATVisionIO visionIO) {
    modules[0] = new Module(flModuleIO, 0);
    modules[1] = new Module(frModuleIO, 1);
    modules[2] = new Module(blModuleIO, 2);
    modules[3] = new Module(brModuleIO, 3);
    this.gyroIO = gyroIO;
    this.vision = new ATVision(visionIO);
    // more code...
```

in `periodic`, we can call `addVisionMeasurement`. the vision’s estimated 3d pose is converted into 2d, ignoring the z axis. we’re assuming robots can’t fly.

```java
if (visionPose.isPresent()) {
  Pose2d visionPose2d = new Pose2d(
    new Translation2d(visionPose.get().getFirst().getTranslation().getX(), visionPose.get().getFirst().getTranslation().getY()),
    new Rotation2d(visionPose.get().getFirst().getRotation().getZ())
  );
  poseEstimator.addVisionMeasurement(visionPose2d, visionPose.get().getSecond());
}
```

returning to `RobotContainer`, we need to configure and pass our new `VisionIO` instance into the `Drivetrain` subsystem.

```java
SimCameraProperties cam1Properties = new SimCameraProperties();
cam1Properties.setCalibration(640, 480, Rotation2d.fromDegrees(100));
cam1Properties.setFPS(20);
visionIO = new ATVisionIOSim(
  List.of(
    Pair.of("camera1", cam1Properties)
  ),
  List.of(
    new Transform3d(new Translation3d(0.1, 0, 0.5), new Rotation3d(0, Math.toRadians(-15), 0))
  ),
  AprilTagFieldLayout.loadField(AprilTagFields.k2024Crescendo),
  swerveDriveSimulation::getSimulatedDriveTrainPose
);
driveSub = new Drivetrain(
    new ModuleIOSim(swerveDriveSimulation.getModules()[0]),
    new ModuleIOSim(swerveDriveSimulation.getModules()[1]),
    new ModuleIOSim(swerveDriveSimulation.getModules()[2]),
    new ModuleIOSim(swerveDriveSimulation.getModules()[3]),
    gyroIO,
    visionIO,
    swerveDriveSimulation
);
```

now, let's look at a demo in AdvantageScope!

- the robot you see represents the "real" position calculated by maple-sim
- the green ghost shows where the robot estimates its position using all available data
- the blue ghost indicates the most recent pose estimation from vision
- the yellow line displays both the path-following trajectory and the yellow ghost shows where the robot should be along the trajectory.

as the robot drives, you can observe its pose estimation drifting. the estimation becomes particularly inaccurate during collisions. however, whenever the robot sees a tag, the green ghost instantly corrects to the true position.

![video](/writing/a-deep-dive-into-swerve/21.mp4)

that concludes this deep dive! while it's a lengthy exploration, i hope i've made these complex concepts digestible.

you can always [reach out to me](https://samliu.dev/contact) with your thoughts or questions!
