package handler

import (
	"setting-service/internal/service"

	"github.com/go-chi/chi/v5"
)

type ProviderHandler struct {
	svc service.ProviderService
}

func NewProviderHandler(svc service.ProviderService) *ProviderHandler {
	return &ProviderHandler{
		svc: svc,
	}
}

// rregister router wires public (jwt protected) routes onto the router
func (h *ProviderHandler) RegisterRoutes(r chi.Router) {
	r.Post("/users/providers", h.svc.SaveProvider)
	r.Get("/users/providers", h.svc.GetSettings)

}
