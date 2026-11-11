function authMiddleware(req, res, next) {
  // Login requirement removed: automatically authenticate all requests as Administrator
  req.user = {
    admin_id: 'ADM-001',
    email: 'admin@ams.local',
    full_name: 'Administrator',
    role: 'SuperAdmin'
  };
  next();
}

module.exports = { authMiddleware };
