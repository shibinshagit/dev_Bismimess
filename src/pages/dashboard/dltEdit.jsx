// ... existing imports ...
import { Switch } from "@material-tailwind/react";

function Add() {
  // ... existing state variables ...

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    point: null,
    plan: [],
    paymentStatus: false,
    startDate: '',
    endDate: '',
    amount: '',
    paymentMethod: '',
    paymentId: '',
    isVeg: false,
  });

  // ... existing useEffect and functions ...

  // Handle changes in the main form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'phone' && value.length > 10) {
      return;
    }

    if (name === 'startDate') {
      // Existing logic...
    } else if (name === 'point') {
      // Existing logic...
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  // ... existing functions ...

  return (
    <div className="flex justify-center my-12">
      <Card className="w-full max-w-lg">
        {/* ... existing code ... */}

        <form onSubmit={handleSubmit}>
          <CardBody className="p-6">
            {/* ... existing inputs ... */}

            {formData.paymentStatus && (
              <>
                {/* ... existing plan checkboxes and date inputs ... */}

                {/* Amount Input */}
                <div className="mb-4">
                  <Input
                    type="number"
                    name="amount"
                    label="Amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Payment Method Select */}
                <div className="mb-4">
                  <Select
                    name="paymentMethod"
                    label="Payment Method"
                    value={formData.paymentMethod}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        paymentMethod: value,
                        paymentId: "", // Reset paymentId when paymentMethod changes
                      })
                    }
                    required
                  >
                    <Option value="Cash">Cash</Option>
                    <Option value="Bank">Bank</Option>
                    <Option value="Online">Online</Option>
                  </Select>
                </div>

                {/* Payment ID Input */}
                <div className="mb-4">
                  <Input
                    type="text"
                    name="paymentId"
                    label="Payment ID"
                    value={formData.paymentId}
                    onChange={handleChange}
                    required={formData.paymentMethod !== "Cash"}
                    disabled={formData.paymentMethod === "Cash"}
                  />
                </div>

                {/* Veg Toggle */}
                <div className="flex items-center mb-4">
                  <Typography variant="small" className="mr-2">
                    Veg
                  </Typography>
                  <Switch
                    checked={formData.isVeg}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isVeg: e.target.checked,
                      })
                    }
                  />
                </div>
              </>
            )}
          </CardBody>

          {/* ... existing buttons ... */}
        </form>
      </Card>
    </div>
  );
}

export default Add;
