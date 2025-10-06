import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

interface MovieCast {
  character: string;
  name: string;
  gender: number;
}

interface CastSectionProps {
  cast: MovieCast[];
}

export default function CastSection({ cast }: CastSectionProps) {
  if (cast.length === 0) return null;

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Cast ({cast.length})
      </Typography>
      <List sx={{ height: 320, overflow: 'auto' }}>
        {cast.map((actor, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={actor.name}
                secondary={actor.character ? `as ${actor.character}` : undefined}
              />
            </ListItem>
            {index < cast.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}