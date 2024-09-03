<div className="mb-4">
              <Input
                type="text"
                name="place"
                label="Place"
                value={formData.place}
                onChange={handleChange}
                required
              />
              {showSuggestions && (
                <List className="border rounded shadow-lg mt-2">
                  {suggestedPlaces
                    .filter((place) =>
                      place.toLowerCase().includes(formData.place.toLowerCase())
                    )
                    .map((place, index) => (
                      <ListItem
                        key={index}
                        onClick={() => handleSuggestionClick(place)}
                        className="cursor-pointer"
                      >
                        {place}
                      </ListItem>
                    ))}
                </List>
              )}
            </div>