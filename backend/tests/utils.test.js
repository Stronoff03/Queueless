const { emitBusinessUpdate } = require('../utils/business_updates');
const { createNotification, createNotifications, notifyAdmins, mapNotificationRow } = require('../utils/notifications');

describe('Utility Functions Tests', () => {
  describe('business_updates.js', () => {
    test('emitBusinessUpdate should call io.emit with correct payload', async () => {
      const mockIo = { emit: jest.fn() };
      const mockBusiness = { id: 'b1', owner_id: 'o1', is_active: 1, approval_status: 'approved' };
      
      await emitBusinessUpdate({ io: mockIo, business: mockBusiness });
      
      expect(mockIo.emit).toHaveBeenCalledWith('business:update', expect.objectContaining({
        businessId: 'b1',
        ownerId: 'o1',
        isActive: true,
      }));
    });

    test('emitBusinessUpdate should return early if io or business is missing', async () => {
      const mockIo = { emit: jest.fn() };
      await emitBusinessUpdate({ io: null, business: {} });
      await emitBusinessUpdate({ io: mockIo, business: null });
      expect(mockIo.emit).not.toHaveBeenCalled();
    });
  });

  describe('notifications.js', () => {
    test('mapNotificationRow should correctly map DB row to object', () => {
      const row = {
        id: 'n1',
        recipient_id: 'u1',
        title: 'T1',
        body: 'B1',
        type: 'test',
        entity_type: 'business',
        entity_id: 'b1',
        is_read: 1,
        metadata: '{"key": "val"}',
        created_at: 'date'
      };
      const result = mapNotificationRow(row);
      expect(result.id).toBe('n1');
      expect(result.is_read).toBe(true);
      expect(result.metadata).toEqual({ key: 'val' });
    });

    test('createNotification should handle disabled notifications', async () => {
      const mockPool = { query: jest.fn().mockResolvedValue([[{ notifications_enabled: 0 }]]) };
      const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
      
      const result = await createNotification({
        pool: mockPool,
        io: mockIo,
        userId: 'u1',
        title: 'T',
        body: 'B'
      });
      
      expect(result).toBeNull();
    });

    test('createNotifications should handle empty array', async () => {
      const result = await createNotifications({ userIds: [] });
      expect(result).toEqual([]);
    });

    test('notifyAdmins should call createNotifications with admin IDs', async () => {
      const mockPool = { 
        query: jest.fn()
          .mockResolvedValueOnce([[{ id: 'admin1' }]]) // For notifyAdmins (SELECT admins)
          .mockResolvedValueOnce([[{ notifications_enabled: 1 }]]) // For createNotification (SELECT enabled)
          .mockResolvedValueOnce([{}]) // For createNotification (INSERT)
          .mockResolvedValueOnce([[{ id: 'n1', recipient_id: 'admin1', title: 'T', body: 'B', metadata: null }]]) // For createNotification (SELECT *)
      };
      const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

      const result = await notifyAdmins({
        pool: mockPool,
        io: mockIo,
        title: 'New Biz',
        body: 'Body'
      });

      expect(mockPool.query).toHaveBeenCalledWith("SELECT id FROM users WHERE role = 'admin'");
      expect(result.length).toBe(1);
    });
  });
});
