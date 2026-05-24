db = db.getSiblingDB("yogesh_studio");

db.rooms.createIndex({ name: 1 });
db.rooms.createIndex({ created_at: -1 });
