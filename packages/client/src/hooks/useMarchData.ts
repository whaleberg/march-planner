import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '../lib/trpc';

// March data hooks
export const useMarch = (marchId: string) => {
  return useQuery(trpc.march.getById.queryOptions({ id: marchId }));
};

export const useMarches = () => {
  return useQuery(trpc.march.list.queryOptions({}));
};

export const useUpdateMarch = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.march.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: trpc.march.pathKey()});
    },
  }));
};

// March Days hooks
export const useMarchDay = (dayId: string) => {
  return useQuery(trpc.marchDays.getById.queryOptions({ id: dayId }));
};

export const useMarchDays = (marchId: string) => {
  return useQuery(trpc.marchDays.list.queryOptions({ marchId }));
};

export const useCreateMarchDay = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.marchDays.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey() });
    },
  }));
};

export const useUpdateMarchDay = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.marchDays.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey() });
    },
  }));
};

export const useDeleteMarchDay = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.marchDays.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey() });
    },
  }));
};

// Marchers hooks
export const useMarchers = (marchId?: string) => {
  return useQuery(trpc.marchers.list.queryOptions({ marchId }));
};

export const useMarcher = (marcherId: string) => {
  return useQuery(trpc.marchers.getById.queryOptions({ id: marcherId }));
};

export const useCreateMarcher = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.marchers.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.marchers.pathKey() });
    },
  }));
};

export const useUpdateMarcher = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.marchers.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.marchers.pathKey() });
    },
  }));
};

export const useDeleteMarcher = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.marchers.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.marchers.pathKey() });
    },
  }));
};

// Organizations hooks
export const usePartnerOrganizations = (marchId?: string) => {
  return useQuery(trpc.organizations.list.queryOptions({ marchId }));
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.organizations.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.organizations.pathKey() });
    },
  }));
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.organizations.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.organizations.pathKey() });
    },
  }));
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.organizations.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.organizations.pathKey() });
    },
  }));
};

// Vehicles hooks
export const useVehicles = (marchId?: string) => {
  return useQuery(trpc.vehicles.list.queryOptions({ marchId }));
};

export const useVehicle = (vehicleId: string) => {
  return useQuery(trpc.vehicles.getById.queryOptions({ id: vehicleId }));
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.vehicles.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: trpc.vehicles.pathKey() });
    },
  }));
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.vehicles.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: trpc.vehicles.pathKey() });
    },
  }));
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.vehicles.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.vehicles.pathKey()});
    },
  }));
};

// Assignment hooks
export const useMarcherDayAssignments = (dayId?: string, marcherId?: string) => {
  return useQuery(trpc.assignments.marcherDay.queryOptions({ dayId, marcherId }));
};

export const useCreateMarcherDayAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.assignments.createMarcherDay.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.assignments.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.marchers.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey()});
    },
  }));
};

export const useDeleteMarcherDayAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.assignments.deleteMarcherDay.mutationOptions({
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.assignments.pathKey()});
        queryClient.invalidateQueries({ queryKey: trpc.marchers.pathKey()});
        queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey()});
    },
  }));
};

export const useOrganizationDayAssignments = (dayId?: string, organizationId?: string) => {
  return useQuery(trpc.assignments.organizationDay.queryOptions({ dayId, organizationId }));
};

export const useCreateOrganizationDayAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.assignments.createOrganizationDay.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.assignments.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.organizations.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey()});
    },
  }));
};

export const useDeleteOrganizationDayAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.assignments.deleteOrganizationDay.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.assignments.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.organizations.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey()});
    },
  }));
};

// Schedule hooks
export const useVehicleDaySchedules = (dayId?: string, vehicleId?: string) => {
  return useQuery(trpc.schedules.vehicleDay.queryOptions({ dayId, vehicleId }));
};

export const useCreateVehicleDaySchedule = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.schedules.createVehicleDay.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.schedules.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.vehicles.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey()});
    },
  }));
};

export const useUpdateVehicleDaySchedule = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.schedules.updateVehicleDay.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.schedules.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.vehicles.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey()});
    },
  }));
};

export const useDeleteVehicleDaySchedule = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.schedules.deleteVehicleDay.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.schedules.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.vehicles.pathKey()});
      queryClient.invalidateQueries({ queryKey: trpc.marchDays.pathKey()});
    },
  }));
};

// Stats hooks
export const useMarchStats = (marchId: string) => {
  return useQuery(trpc.summary.marchers.queryOptions({ marchId }));
};

export const useDayStats = (dayId: string) => {
  return useQuery(trpc.summary.marchersByDay.queryOptions({ dayId }));
};

// Summary hooks
export const useDaysSummary = (marchId: string) => {
  return useQuery(trpc.summary.days.queryOptions({ marchId }, { enabled: !!marchId }));
};

export const usePartnersSummary = (marchId: string) => {
  return useQuery(trpc.summary.partners.queryOptions({ marchId }, { enabled: !!marchId }));
};

export const useVehiclesSummary = (marchId: string) => {
  return useQuery(trpc.summary.vehicles.queryOptions({ marchId }, { enabled: !!marchId }));
};