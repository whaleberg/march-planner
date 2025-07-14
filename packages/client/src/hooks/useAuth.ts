import { useQueryClient } from '@tanstack/react-query';
import { trpc } from '../lib/trpc';

// Auth hooks using tRPC
export const useLogin = () => {
  const queryClient = useQueryClient();
  return trpc.auth.login.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return trpc.auth.register.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useVerifyToken = (token: string, isAuthenticated: boolean) => {
  return trpc.auth.verifyToken.useQuery({ token }, { enabled: isAuthenticated });
};

export const useMe = () => {
  return trpc.auth.me.useQuery();
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  return trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}; 