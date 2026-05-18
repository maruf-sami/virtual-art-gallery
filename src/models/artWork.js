import mongoose from 'mongoose';

const ArtworkSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  artist_name: { 
    type: String, 
    required: true 
  },
  artistId: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: true 
  }, 
  dimension: { 
    type: String, 
    required: true 
  }, 
  medium: { 
    type: String, 
    required: true 
  }, 
  artist_note: { 
    type: String, 
    default: '' 
  },
  love_count:{
    type:Number,
    default:0
  }
}, { 
  timestamps: true 
});

ArtworkSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

ArtworkSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Artwork || mongoose.model('Artwork', ArtworkSchema);