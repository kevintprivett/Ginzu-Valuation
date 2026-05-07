import {
  Box,
  Paper,
  Stack,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

const Footer = () => {
  return (
    <Box
      sx={{
        width: 400,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
      }}
    >
      <Stack alignItems="center">
        <Paper
          sx={{
            width: 250,
            mt: 2,
            mb: 2,
          }}
        >
          <Button
            variant="outlined"
            href="https://github.com/kevintprivett/Ginzu-Valuation"
            sx={{
              textAlign: 'center',
              textTransform: 'none',
            }}
          >
            <Typography variant="h6">
              Learn more about this project on GitHub
            </Typography>
          </Button>
        </Paper>
        <Box>
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
            }}
          >
            Created by Kevin Privett
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton href="https://github.com/kevintprivett">
            <GitHubIcon
              sx={{
                fontSize: 60,
              }}
            />
          </IconButton>
          <IconButton href="https://www.linkedin.com/in/kevin-privett-810722a4">
            <LinkedInIcon
              sx={{
                fontSize: 60,
              }}
            />
          </IconButton>
          <IconButton href="mailto:kevintprivett@gmail.com">
            <AlternateEmailIcon
              sx={{
                fontSize: 60,
              }}
            />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;
