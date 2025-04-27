package com.project.spar.security;

import com.project.spar.constants.AppConstants;
import com.project.spar.model.User;
import com.project.spar.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(AppConstants.USER_NOT_FOUND));
        return new UserDetailsImpl(u);
    }
}
