namespace AuthService.Exceptions;

public class AppointmentException : Exception
{
    public AppointmentException(string message) : base(message) { }
    public AppointmentException(string message, Exception inner) : base(message, inner) { }
}

public class SlotUnavailableException : AppointmentException
{
    public SlotUnavailableException(DateTime appointmentDate, Guid doctorId)
        : base($"Time slot at {appointmentDate} is not available for doctor {doctorId}")
    {
        AppointmentDate = appointmentDate;
        DoctorId = doctorId;
    }

    public DateTime AppointmentDate { get; }
    public Guid DoctorId { get; }
}

public class DoctorNotFoundException : AppointmentException
{
    public DoctorNotFoundException(Guid doctorId, Guid tenantId)
        : base($"Doctor {doctorId} not found in tenant {tenantId}")
    {
        DoctorId = doctorId;
        TenantId = tenantId;
    }

    public Guid DoctorId { get; }
    public Guid TenantId { get; }
}

public class PatientNotFoundException : AppointmentException
{
    public PatientNotFoundException(Guid patientId, Guid tenantId)
        : base($"Patient {patientId} not found in tenant {tenantId}")
    {
        PatientId = patientId;
        TenantId = tenantId;
    }

    public Guid PatientId { get; }
    public Guid TenantId { get; }
}

public class AppointmentNotFoundException : AppointmentException
{
    public AppointmentNotFoundException(Guid appointmentId, Guid tenantId)
        : base($"Appointment {appointmentId} not found in tenant {tenantId}")
    {
        AppointmentId = appointmentId;
        TenantId = tenantId;
    }

    public Guid AppointmentId { get; }
    public Guid TenantId { get; }
}

public class InvalidAppointmentStateException : AppointmentException
{
    public InvalidAppointmentStateException(Guid appointmentId, string currentState, string attemptedOperation)
        : base($"Cannot perform operation '{attemptedOperation}' on appointment {appointmentId} in state '{currentState}'")
    {
        AppointmentId = appointmentId;
        CurrentState = currentState;
        AttemptedOperation = attemptedOperation;
    }

    public Guid AppointmentId { get; }
    public string CurrentState { get; }
    public string AttemptedOperation { get; }
}