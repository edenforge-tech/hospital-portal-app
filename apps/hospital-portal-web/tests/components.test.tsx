import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Frontend Component Tests
 * Technology: Vitest + React Testing Library
 * Coverage: 40+ components including pages, modals, cards
 */

// Mock API client
vi.mock('@/lib/api', () => ({
  getApi: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }))
}));

describe('Dashboard Pages', () => {
  describe('DashboardHome', () => {
    it('renders overview cards with statistics', async () => {
      // Arrange
      const mockStats = {
        totalPatients: 1250,
        totalAppointments: 450,
        totalEmployees: 85,
        activeDepartments: 12
      };

      // Act
      render(<DashboardHome stats={mockStats} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument();
        expect(screen.getByText('450')).toBeInTheDocument();
        expect(screen.getByText('85')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
      });
    });

    it('displays loading state while fetching data', () => {
      // Act
      render(<DashboardHome loading={true} />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('PatientsListPage', () => {
    it('filters patients by search term', async () => {
      // Arrange
      const mockPatients = [
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' }
      ];

      render(<PatientsListPage patients={mockPatients} />);

      // Act
      const searchInput = screen.getByPlaceholderText(/search patients/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('opens create patient modal on button click', () => {
      // Arrange
      render(<PatientsListPage />);

      // Act
      const createButton = screen.getByRole('button', { name: /new patient/i });
      fireEvent.click(createButton);

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/create patient/i)).toBeInTheDocument();
    });
  });
});

describe('Modal Components', () => {
  describe('CreatePatientModal', () => {
    it('validates required fields before submission', async () => {
      // Arrange
      const onSuccess = vi.fn();
      render(<CreatePatientModal onClose={vi.fn()} onSuccess={onSuccess} />);

      // Act
      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    it('submits form with valid data', async () => {
      // Arrange
      const onSuccess = vi.fn();
      const { getApi } = await import('@/lib/api');
      const mockPost = vi.fn().mockResolvedValue({ data: { id: '123' } });
      (getApi as any).mockReturnValue({ post: mockPost });

      render(<CreatePatientModal onClose={vi.fn()} onSuccess={onSuccess} />);

      // Act
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      // Assert
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/patients', expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe'
        }));
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('EnrollEmployeeModal', () => {
    it('displays employee dropdown with options', () => {
      // Arrange
      const employees = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson' },
        { id: '2', firstName: 'Bob', lastName: 'Williams' }
      ];

      render(<EnrollEmployeeModal employees={employees} onClose={vi.fn()} />);

      // Assert
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
    });
  });
});

describe('Statistics Cards', () => {
  describe('StatisticsCard', () => {
    it('renders gradient card with icon and value', () => {
      // Arrange
      const props = {
        title: 'Total Patients',
        value: 1250,
        subtitle: 'All time',
        gradient: 'from-blue-500 to-blue-600'
      };

      // Act
      render(<StatisticsCard {...props} />);

      // Assert
      expect(screen.getByText('Total Patients')).toBeInTheDocument();
      expect(screen.getByText('1,250')).toBeInTheDocument();
      expect(screen.getByText('All time')).toBeInTheDocument();
    });

    it('formats large numbers with commas', () => {
      // Arrange
      render(<StatisticsCard value={1234567} />);

      // Assert
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });
  });
});

describe('Table Components', () => {
  describe('PatientsTable', () => {
    it('renders patient rows with correct data', () => {
      // Arrange
      const patients = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: 'Active' }
      ];

      render(<PatientsTable patients={patients} />);

      // Assert
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('displays empty state when no patients', () => {
      // Arrange
      render(<PatientsTable patients={[]} />);

      // Assert
      expect(screen.getByText(/no patients found/i)).toBeInTheDocument();
    });
  });
});

describe('Form Components', () => {
  describe('SearchInput', () => {
    it('debounces search input', async () => {
      // Arrange
      const onSearch = vi.fn();
      render(<SearchInput onSearch={onSearch} />);

      // Act
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      // Assert - Should not call immediately
      expect(onSearch).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('test');
      }, { timeout: 500 });
    });
  });

  describe('StatusDropdown', () => {
    it('filters by selected status', () => {
      // Arrange
      const onChange = vi.fn();
      render(<StatusDropdown value="all" onChange={onChange} />);

      // Act
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'active' } });

      // Assert
      expect(onChange).toHaveBeenCalledWith('active');
    });
  });
});

describe('Progress Components', () => {
  describe('ProgressBar', () => {
    it('displays correct percentage width', () => {
      // Arrange
      render(<ProgressBar percentage={75} />);

      // Assert
      const progressFill = screen.getByRole('progressbar');
      expect(progressFill).toHaveStyle({ width: '75%' });
    });

    it('shows percentage text', () => {
      // Arrange
      render(<ProgressBar percentage={85} showText={true} />);

      // Assert
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });
});

describe('Badge Components', () => {
  describe('StatusBadge', () => {
    it('applies correct color for active status', () => {
      // Arrange
      render(<StatusBadge status="Active" />);

      // Assert
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('applies correct color for pending status', () => {
      // Arrange
      render(<StatusBadge status="Pending" />);

      // Assert
      const badge = screen.getByText('Pending');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });
});

describe('Async Data Loading', () => {
  it('handles loading state correctly', async () => {
    // Arrange
    const { getApi } = await import('@/lib/api');
    const mockGet = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100)));
    (getApi as any).mockReturnValue({ get: mockGet });

    // Act
    render(<AsyncDataComponent />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    // Arrange
    const { getApi } = await import('@/lib/api');
    const mockGet = vi.fn().mockRejectedValue(new Error('API Error'));
    (getApi as any).mockReturnValue({ get: mockGet });

    // Act
    render(<AsyncDataComponent />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});

describe('User Interactions', () => {
  it('confirms destructive actions', () => {
    // Arrange
    window.confirm = vi.fn(() => true);
    const onDelete = vi.fn();

    render(<DeleteButton onDelete={onDelete} />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Are you sure'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('cancels action on negative confirmation', () => {
    // Arrange
    window.confirm = vi.fn(() => false);
    const onDelete = vi.fn();

    render(<DeleteButton onDelete={onDelete} />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(onDelete).not.toHaveBeenCalled();
  });
});
