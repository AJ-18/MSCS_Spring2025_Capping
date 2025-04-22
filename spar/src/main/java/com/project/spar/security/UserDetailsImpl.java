package com.project.spar.security;

import com.project.spar.model.User;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {
    private User user;
    public Collection<? extends GrantedAuthority> getAuthorities(){ return null; }
    public String getPassword(){ return user.getPassword(); }
    public String getUsername(){ return user.getUsername(); }

    public Long getId() {
        return user.getId();
    }
    public boolean isAccountNonExpired(){ return true; }
    public boolean isAccountNonLocked(){ return true; }
    public boolean isCredentialsNonExpired(){ return true; }
    public boolean isEnabled(){ return true; }

}
