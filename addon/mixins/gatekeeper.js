/*
 * Copyright (c) 2016-2018 Esri
 * Apache-2.0
*/

/**
 * mixins/gatekeeper.js
 *
 * Used to extend the ToriiSession with ArcGIS specific helper methods
 *
 */
import { equal, deprecatingAlias, not } from '@ember/object/computed';

import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
import { debug, warn } from '@ember/debug';
import { isArray } from '@ember/array';
import Mixin from '@ember/object/mixin';
import {
  getPortalHostname,
  getPortalRestUrl,
  hubBaseFromPortalUrl
} from 'torii-provider-arcgis/utils/url-utils';

export default Mixin.create({

  /**
   * Org Admins must have the org_admin role and
   * NO roleId
   */
  isAdmin () {
    let user = this.get('currentUser');
    let val = false;
    if (user && user.role === 'org_admin' && !user.roleId) {
      val = true;
    }
    return val;
  },

  /**
   * Check if the current user is in a specific role
   * In ArcGIS Online, users can only have a single role.
   */
  isInRole (role) {
    let user = this.get('currentUser');

    if (user) {
      return user.role === role;
    } else {
      return false;
    }
  },

  /**
   * Check if the user is a member of a group
   */
  isGroupMember (groupId) {
    let user = this.get('currentUser');
    if (!isArray(user.groups)) {
      // if the provider has not been configured to load groups, show a warning...
      debug('Session.isGroupMember was called, but torii-provider-arcgis has not been configured to fetch user groups. Please see documentation. (https://github.com/dbouwman/torii-provider-arcgis#ember-cli-torii-provider-arcgis)');
      return false;
    } else {
      // look up the group in the groups array by it's Id
      let group = user.groups.find((g) => {
        return g.id === groupId;
      });
      if (group) {
        return true;
      } else {
        return false;
      }
    }
  },

  /**
   * Is the specified priviledge is the list of priviledges
   * assigned to the current user?
   */
  hasPrivilege (privilege) {
    let user = this.get('currentUser');
    if (user) {
      let privs = user.privileges || [];
      return (privs.indexOf(privilege) > -1);
    } else {
      return false;
    }
  },

  /**
   * Does the current user have any of the passed in privileges
   */
  hasAnyPrivilege (privileges) {
    let result = false;
    // check that we have an array
    if (isArray(privileges)) {
      for (var i = 0; i < privileges.length; i++) {
        if (this.hasPrivilege(privileges[i])) {
          result = true;
        }
      }
    } else {
      warn('Session.hasAnyPrivilege was not passed an array. Please use .hasPrivilege instead.');
    }
    return result;
  },

  /**
   * Does the current user have ALL the passed in privileges
   */
  hasAllPrivileges (privileges) {
    let result = false;
    // check that we have an array
    if (isArray(privileges)) {
      let chks = privileges.map(this.hasPrivilege, this);
      // ensure that all checks return true...
      result = chks.indexOf(false) === -1;
    } else {
      warn('Session.hasAllPrivileges was not passed an array. Please use .hasPrivilege instead.');
    }
    return result;
  },

  /**
   * Allows for quick check if a user is in a set of roles
   */
  isInAnyRole (roles) {
    let result = false;
    // check that we have an array
    if (isArray(roles)) {
      for (var i = 0; i < roles.length; i++) {
        if (this.isInRole(roles[i])) {
          result = true;
        }
      }
    } else {
      warn('Session.isInAnyRole was not passed an array. Please use .isInRole instead.');
    }
    return result;
  },

  /**
   * Check if the user is in a specific org.
   * This is used in conjunction with feature flags
   * to control access to features under development
   */
  isInOrg (orgId) {
    let portal = this.get('portal');
    if (portal) {
      return (portal.id === orgId);
    } else {
      return false;
    }
  },

  /**
   * Allows for a quick check if a user is a member of
   * any of a set of orgs
   */
  isInAnyOrg (orgs) {
    let result = false;
    // check that we have an array
    if (isArray(orgs)) {
      for (var i = 0; i < orgs.length; i++) {
        if (this.isInOrg(orgs[i])) {
          result = true;
        }
      }
    } else {
      warn('Session.isInAnyOrg was not passed an array. Please use .isInOrg instead.');
    }
    return result;
  },

  /**
   * Returns a protocol-less hostname for the Portal
   */
  portalHostname: computed('isAuthenticated', 'portal', function () {
    let result;
    if (this.get('isAuthenticated')) {
      result = getPortalHostname(this.get('portal'));
    } else {
      const config = getOwner(this).resolveRegistration('config:environment');
      result = config.torii.providers['arcgis-oauth-bearer'].portalUrl;
      result = result.replace(/https?:\/\//, '');
    }
    return result;
  }),

  /**
   * Return the full url to the Portal's REST API
   */
  portalRestUrl: computed('isAuthenticated', 'portal', function () {
    let result;
    if (this.get('isAuthenticated')) {
      result = getPortalRestUrl(this.get('portal'));
    } else {
      const config = getOwner(this).resolveRegistration('config:environment');
      result = config.torii.providers['arcgis-oauth-bearer'].portalUrl;
      result = `${this.get('portalHostname')}/sharing/rest`;
    }
    return result;
  }),

  /**
   * Returns a URL for the current user's Hub Home
   */
  userHubHome: computed('isAuthenticated', 'portal', function () {
    if (this.get('isPortal')) {
      const base = window.location.href.split('#')[0];
      return `${base}#/home`;
    }
    if (this.get('portal.portalProperties.hub.settings.hubHome')) {
      return this.get('portal.portalProperties.hub.settings.hubHome');
    }
    const hubBase = hubBaseFromPortalUrl(this.get('portalUrl'));
    return `https://${this.get('portal.urlKey')}.${hubBase}.arcgis.com`;
  }),

  isLevelOne: equal('currentUser.level', '1'),

  isLevelTwo: equal('currentUser.level', '2'),

  portalHostName: deprecatingAlias('portalHostname', {
    id: 'torii-provider-arcgis::portalHostName',
    until: '10.0.0'
  }),

  /**
   * Deprecated - use portalHostName
   */
  orgPortalUrl: deprecatingAlias('portalHostName', {
    id: 'torii-provider-arcgis::orgPortalUrl',
    until: '10.0.0'
  }),

  isPublicUser: not('portal.portalProperties'),

  isCommunityOrgUser: equal('portal.subscriptionInfo.type', 'Community'),

  isEsriUser: equal('portal.subscriptionInfo.type', 'In House'),
});
