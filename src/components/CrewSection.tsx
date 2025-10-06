import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

interface MovieCrew {
  name: string;
  job: string;
  department: string;
  gender: number;
}

interface CrewSectionProps {
  crew: MovieCrew[];
}

export default function CrewSection({ crew }: CrewSectionProps) {
  if (crew.length === 0) return null;

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Crew ({crew.length})
      </Typography>
      <List sx={{ height: 320, overflow: 'auto' }}>
        {crew.map((member, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={member.name}
                secondary={`${member.job}${member.department ? ` (${member.department})` : ''}`}
              />
            </ListItem>
            {index < crew.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}