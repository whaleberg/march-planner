import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '../lib/trpc';

// Auth hooks using tRPC
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.auth.login.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.auth.pathKey() });
    },
  }));
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.auth.register.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.auth.pathKey() });
    },
  }));
};

export const useVerifyToken = (token: string, isAuthenticated: boolean) => {
  return useQuery(trpc.auth.verifyToken.queryOptions({ token }, { enabled: isAuthenticated }));
};

export const useMe = () => {
  return useQuery(trpc.auth.me.queryOptions());
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.auth.updateProfile.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.auth.pathKey() });
    },
  }));
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  return useMutation(trpc.auth.changePassword.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.auth.pathKey() });
    },
  }));
}; 