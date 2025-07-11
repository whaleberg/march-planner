import { useQueryClient } from '@tanstack/react-query';
import { trpc } from '../lib/trpc';

// March data hooks
export const useMarch = (marchId: string) => {
  return trpc.march.getById.useQuery({ id: marchId });
};

export const useMarches = () => {
  return trpc.march.list.useQuery({});
};

export const useUpdateMarch = () => {
  const queryClient = useQueryClient();
  return trpc.march.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['march'] });
    },
  });
};

// March Days hooks
export const useMarchDay = (dayId: string) => {
  return trpc.marchDays.getById.useQuery({ id: dayId });
};

export const useMarchDays = (marchId: string) => {
  return trpc.marchDays.list.useQuery({ marchId });
};

export const useCreateMarchDay = () => {
  const queryClient = useQueryClient();
  return trpc.marchDays.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

export const useUpdateMarchDay = () => {
  const queryClient = useQueryClient();
  return trpc.marchDays.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

export const useDeleteMarchDay = () => {
  const queryClient = useQueryClient();
  return trpc.marchDays.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

// Marchers hooks
export const useMarchers = (marchId?: string) => {
  return trpc.marchers.list.useQuery({ marchId });
};

export const useMarcher = (marcherId: string) => {
  return trpc.marchers.getById.useQuery({ id: marcherId });
};

export const useCreateMarcher = () => {
  const queryClient = useQueryClient();
  return trpc.marchers.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marchers'] });
    },
  });
};

export const useUpdateMarcher = () => {
  const queryClient = useQueryClient();
  return trpc.marchers.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marchers'] });
    },
  });
};

export const useDeleteMarcher = () => {
  const queryClient = useQueryClient();
  return trpc.marchers.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marchers'] });
    },
  });
};

// Organizations hooks
export const usePartnerOrganizations = (marchId?: string) => {
  return trpc.organizations.list.useQuery({ marchId });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return trpc.organizations.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return trpc.organizations.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return trpc.organizations.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Vehicles hooks
export const useVehicles = (marchId?: string) => {
  return trpc.vehicles.list.useQuery({ marchId });
};

export const useVehicle = (vehicleId: string) => {
  return trpc.vehicles.getById.useQuery({ id: vehicleId });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return trpc.vehicles.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return trpc.vehicles.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return trpc.vehicles.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

// Assignment hooks
export const useMarcherDayAssignments = (dayId?: string, marcherId?: string) => {
  return trpc.assignments.marcherDay.useQuery({ dayId, marcherId });
};

export const useCreateMarcherDayAssignment = () => {
  const queryClient = useQueryClient();
  return trpc.assignments.createMarcherDay.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['marchers'] });
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

export const useDeleteMarcherDayAssignment = () => {
  const queryClient = useQueryClient();
  return trpc.assignments.deleteMarcherDay.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['marchers'] });
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

export const useOrganizationDayAssignments = (dayId?: string, organizationId?: string) => {
  return trpc.assignments.organizationDay.useQuery({ dayId, organizationId });
};

export const useCreateOrganizationDayAssignment = () => {
  const queryClient = useQueryClient();
  return trpc.assignments.createOrganizationDay.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

export const useDeleteOrganizationDayAssignment = () => {
  const queryClient = useQueryClient();
  return trpc.assignments.deleteOrganizationDay.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

// Schedule hooks
export const useVehicleDaySchedules = (dayId?: string, vehicleId?: string) => {
  return trpc.schedules.vehicleDay.useQuery({ dayId, vehicleId });
};

export const useCreateVehicleDaySchedule = () => {
  const queryClient = useQueryClient();
  return trpc.schedules.createVehicleDay.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

export const useUpdateVehicleDaySchedule = () => {
  const queryClient = useQueryClient();
  return trpc.schedules.updateVehicleDay.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

export const useDeleteVehicleDaySchedule = () => {
  const queryClient = useQueryClient();
  return trpc.schedules.deleteVehicleDay.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['marchDays'] });
    },
  });
};

// Stats hooks
export const useMarchStats = (marchId: string) => {
  return trpc.summary.marchers.useQuery({ marchId });
};

export const useDayStats = (marchId: string, dayId: string) => {
  const data = trpc.summary.marchersByDay.useQuery({ marchId });
  const dayStats = data.data?.find((day: any) => day.dayId === dayId);
  return dayStats;
}; 